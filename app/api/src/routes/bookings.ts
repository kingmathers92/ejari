import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireHost, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { propertyId, checkIn, checkOut, guestsCount } = req.body;

  if (!propertyId || !checkIn || !checkOut || !guestsCount) {
    return res.status(400).json({ error: "propertyId, checkIn, checkOut, guestsCount required" });
  }

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ error: "checkOut must be after checkIn" });
  }
  if (checkInDate <= new Date()) {
    return res.status(400).json({ error: "checkIn must be in the future" });
  }

  // Load the property to validate guests and check the host isn't self-booking
  const property = await prisma.property.findUnique({ where: { id: propertyId } });

  if (!property || !property.isActive) {
    return res.status(404).json({ error: "Property not found or inactive" });
  }
  if (property.hostId === req.user!.id) {
    return res.status(400).json({ error: "You cannot book your own property" });
  }
  if (Number(guestsCount) > property.maxGuests) {
    return res.status(400).json({ error: `Maximum ${property.maxGuests} guests for this property` });
  }

  // ── Double-booking conflict check ────────────────────────────────────────
  // This runs in parallel — both checks hit the DB simultaneously.
  // If EITHER returns a result, the dates are taken.
  const [conflictingBooking, conflictingBlock] = await Promise.all([
    prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn:  { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    }),
    prisma.blockedDate.findFirst({
      where: {
        propertyId,
        startDate: { lt: checkOutDate },
        endDate:   { gt: checkInDate },
      },
    }),
  ]);

  if (conflictingBooking || conflictingBlock) {
    return res.status(409).json({
      error: "These dates are not available. Please choose different dates.",
    });
  }

  // total price
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = Number(property.pricePerNight) * nights;

  const booking = await prisma.booking.create({
    data: {
      propertyId,
      guestId: req.user!.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestsCount: Number(guestsCount),
      totalPrice,
    },
    include: {
      property: { select: { title: true, city: true, pricePerNight: true } },
    },
  });

  return res.status(201).json({ ...booking, nights });
});

// ── GET /bookings — list bookings for current user
// Hosts see bookings for their properties.
// Guests see their own bookings.
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  const bookings = await prisma.booking.findMany({
    where: user.role === "HOST"
      ? { property: { hostId: user.id } }
      : { guestId: user.id },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          photos: { where: { isCover: true }, take: 1 },
        },
      },
      guest:   { select: { fullName: true, phone: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(bookings);
});

// ── GET /bookings/stats — host dashboard numbers
// Must come before /:id or "stats" gets treated as a booking ID
router.get("/stats", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const hostId = req.user!.id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [total, confirmed, pending, revenue, monthRevenue, activeProperties] =
    await Promise.all([
      prisma.booking.count({ where: { property: { hostId } } }),
      prisma.booking.count({ where: { property: { hostId }, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { property: { hostId }, status: "PENDING" } }),
      prisma.booking.aggregate({
        where: { property: { hostId }, paymentStatus: "PAID" },
        _sum: { totalPrice: true },
      }),
      prisma.booking.aggregate({
        where: { property: { hostId }, paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
        _sum: { totalPrice: true },
      }),
      prisma.property.count({ where: { hostId, isActive: true } }),
    ]);

  return res.json({
    totalBookings: total,
    confirmedBookings: confirmed,
    pendingBookings: pending,
    totalRevenue: Number(revenue._sum.totalPrice) || 0,
    monthRevenue: Number(monthRevenue._sum.totalPrice) || 0,
    activeProperties,
  });
});

// ── GET /bookings/:id — booking detail
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      property: {
        include: {
          photos: { orderBy: { order: "asc" } },
          host: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        },
      },
      guest:    { select: { id: true, fullName: true, phone: true } },
      payment:  true,
      invoice:  true,
      messages: {
        include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { sentAt: "asc" },
      },
    },
  });

  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // Only the guest and the host can see this booking
  const isGuest = booking.guestId === req.user!.id;
  const isHost  = booking.property.host.id === req.user!.id;
  if (!isGuest && !isHost) {
    return res.status(403).json({ error: "Access denied" });
  }

  return res.json(booking);
});

// ── POST /bookings/:id/confirm — host confirms a booking
router.post("/:id/confirm", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { property: true },
  });

  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.property.hostId !== req.user!.id) {
    return res.status(403).json({ error: "Not your property" });
  }
  if (booking.status !== "PENDING") {
    return res.status(400).json({ error: `Cannot confirm a ${booking.status} booking` });
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CONFIRMED" },
  });

  return res.json(updated);
});

// ── POST /bookings/:id/cancel
router.post("/:id/cancel", authMiddleware, async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { property: true },
  });

  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const isGuest = booking.guestId === req.user!.id;
  const isHost  = booking.property.hostId === req.user!.id;
  if (!isGuest && !isHost) return res.status(403).json({ error: "Access denied" });
  if (booking.status === "CANCELLED")  return res.status(400).json({ error: "Already cancelled" });
  if (booking.status === "COMPLETED")  return res.status(400).json({ error: "Stay already completed" });

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });

  return res.json(updated);
});

export default router;