import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireHost, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { city, checkIn, checkOut, guests, minPrice, maxPrice } = req.query;

  const checkInDate  = checkIn  ? new Date(String(checkIn))  : null;
  const checkOutDate = checkOut ? new Date(String(checkOut)) : null;

  // if one date is provided, both must be
  if ((checkInDate || checkOutDate) && !(checkInDate && checkOutDate)) {
    return res.status(400).json({ error: "Both checkIn and checkOut required" });
  }

  if (checkInDate && checkOutDate && checkInDate >= checkOutDate) {
    return res.status(400).json({ error: "checkOut must be after checkIn" });
  }

  let unavailableIds: string[] = [];

  if (checkInDate && checkOutDate) {
    const [bookedProps, blockedProps] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
        select: { propertyId: true },
      }),
      prisma.blockedDate.findMany({
        where: {
          startDate: { lt: checkOutDate },
          endDate:   { gt: checkInDate },
        },
        select: { propertyId: true },
      }),
    ]);

    unavailableIds = [
      ...new Set([
        ...bookedProps.map((b) => b.propertyId),
        ...blockedProps.map((b) => b.propertyId),
      ]),
    ];
  }

  const properties = await prisma.property.findMany({
    where: {
      isActive: true,
      ...(city ? { city: { equals: String(city), mode: "insensitive" } } : {}),
      ...(guests ? { maxGuests: { gte: Number(guests) } } : {}),
      ...(minPrice || maxPrice
        ? {
            pricePerNight: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
      ...(unavailableIds.length > 0 ? { id: { notIn: unavailableIds } } : {}),
    },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      reviews: { select: { rating: true } },
      host: { select: { id: true, fullName: true, idVerified: true } },
    },
    orderBy: { createdAt: "desc" },
  });


  const result = properties.map((p) => ({
    ...p,
    avgRating:
      p.reviews.length > 0
        ? Math.round(
            (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 10
          ) / 10
        : null,
    reviewCount: p.reviews.length,
    reviews: undefined,
  }));

  return res.json(result);
});


router.get("/my", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: { hostId: req.user!.id },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(properties);
});

router.get("/:id", async (req: Request, res: Response) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: {
      photos: { orderBy: { order: "asc" } },
      host: {
        select: { id: true, fullName: true, idVerified: true, avatarUrl: true, createdAt: true },
      },
      reviews: {
        include: {
          reviewer: { select: { fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!property) return res.status(404).json({ error: "Property not found" });

  const avgRating =
    property.reviews.length > 0
      ? Math.round(
          (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length) * 10
        ) / 10
      : null;

  return res.json({ ...property, avgRating });
});

router.post("/", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const { title, description, city, address, lat, lng,
          maxGuests, bedrooms, bathrooms, pricePerNight, icalUrl } = req.body;

  if (!title || !city || !maxGuests || !pricePerNight) {
    return res.status(400).json({
      error: "title, city, maxGuests, and pricePerNight are required",
    });
  }

  const property = await prisma.property.create({
    data: {
      hostId: req.user!.id,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      city: String(city).trim(),
      address: address ? String(address).trim() : "",
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      maxGuests: Number(maxGuests),
      bedrooms: bedrooms ? Number(bedrooms) : 1,
      bathrooms: bathrooms ? Number(bathrooms) : 1,
      pricePerNight: Number(pricePerNight),
      icalUrl: icalUrl || null,
    },
  });

  return res.status(201).json(property);
});

router.put("/:id", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });

  if (!property) return res.status(404).json({ error: "Property not found" });

  // Only the owner can update
  if (property.hostId !== req.user!.id) {
    return res.status(403).json({ error: "You can only edit your own properties" });
  }

  const { title, description, city, address, maxGuests,
          bedrooms, bathrooms, pricePerNight, icalUrl, isActive } = req.body;

  const updated = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      ...(title ? { title: String(title).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(city ? { city: String(city).trim() } : {}),
      ...(address !== undefined ? { address: String(address).trim() } : {}),
      ...(maxGuests ? { maxGuests: Number(maxGuests) } : {}),
      ...(bedrooms ? { bedrooms: Number(bedrooms) } : {}),
      ...(bathrooms ? { bathrooms: Number(bathrooms) } : {}),
      ...(pricePerNight ? { pricePerNight: Number(pricePerNight) } : {}),
      ...(icalUrl !== undefined ? { icalUrl: icalUrl || null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    },
  });

  return res.json(updated);
});

router.post("/:id/photos", authMiddleware, requireHost, async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });

  if (!property) return res.status(404).json({ error: "Property not found" });
  if (property.hostId !== req.user!.id) {
    return res.status(403).json({ error: "Not your property" });
  }

  const { url, isCover, order } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  if (isCover) {
    await prisma.propertyPhoto.updateMany({
      where: { propertyId: req.params.id },
      data: { isCover: false },
    });
  }

  const photo = await prisma.propertyPhoto.create({
    data: {
      propertyId: req.params.id,
      url: String(url),
      isCover: Boolean(isCover),
      order: order ? Number(order) : 0,
    },
  });

  return res.status(201).json(photo);
});

export default router;
