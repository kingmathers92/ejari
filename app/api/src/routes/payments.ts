import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/initiate", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "bookingId required" });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.guestId !== req.user!.id) {
    return res.status(403).json({ error: "Not your booking" });
  }
  if (booking.paymentStatus === "PAID") {
    return res.status(400).json({ error: "Already paid" });
  }

  // In dev, we don't have a real Konnect account, so we return a fake payUrl
  if (process.env.NODE_ENV === "development") {
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalPrice,
        payUrl: `${process.env.FRONTEND_URL}/booking/${bookingId}/mock-pay`,
        status: "PENDING",
      },
      update: {
        payUrl: `${process.env.FRONTEND_URL}/booking/${bookingId}/mock-pay`,
        status: "PENDING",
      },
    });

    return res.json({
      payUrl: payment.payUrl,
      dev: true,
      tip: "POST /payments/dev-confirm with {bookingId} to simulate a successful payment",
    });
  }

  // ── Production — call Konnect API
  try {
    const response = await axios.post(
      "https://api.konnect.network/api/v2/payments/init-payment",
      {
        receiverWalletId: process.env.KONNECT_WALLET_ID,
        token: "TND",
        amount: Math.round(Number(booking.totalPrice) * 1000), // Konnect uses millimes (1 TND = 1000 millimes)
        description: `Ejari Booking #${bookingId.slice(0, 8)}`,
        metadata: { bookingId },
        successUrl: `${process.env.FRONTEND_URL}/booking/${bookingId}/success`,
        failUrl:    `${process.env.FRONTEND_URL}/booking/${bookingId}/fail`,
        webhook:    `${process.env.API_URL}/payments/webhook`,
      },
      { headers: { "x-api-key": process.env.KONNECT_API_KEY } }
    );

    const { payUrl, paymentRef } = response.data;

    await prisma.payment.upsert({
      where: { bookingId },
      create: { bookingId, amount: booking.totalPrice, providerRef: paymentRef, payUrl, status: "PENDING" },
      update: { providerRef: paymentRef, payUrl, status: "PENDING" },
    });

    return res.json({ payUrl });
  } catch (err: any) {
    console.error("[Konnect] initiate error:", err?.response?.data || err.message);
    return res.status(502).json({ error: "Payment provider unavailable. Please try again." });
  }
});

// Simulates Konnect confirming a payment in local development.
router.post("/dev-confirm", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Not found" });
  }

  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "bookingId required" });

  await confirmAndInvoice(bookingId);
  return res.json({ message: "Payment confirmed (dev mode)" });
});

// ── POST /payments/webhook — Konnect notifies us of payment result
// This endpoint is called by Konnect's servers, not the browser.
// Note: express.raw() is applied to this route in index.ts —
// that's why req.body is a Buffer here, not a parsed object.
router.post("/webhook", async (req: Request, res: Response) => {
  // Verify the request came from Konnect using HMAC-SHA256 signature
  if (process.env.KONNECT_WEBHOOK_SECRET) {
    const signature = req.headers["x-konnect-signature"] as string;
    const expected  = "sha256=" + crypto
      .createHmac("sha256", process.env.KONNECT_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expected) {
      console.warn("[Webhook] Invalid signature — rejecting");
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  // Now parse the body
  const body = JSON.parse((req.body as Buffer).toString());
  const { status, metadata, payment_ref } = body;
  const bookingId = metadata?.bookingId;

  if (!bookingId) return res.sendStatus(200);

  if (status === "completed") {
    await confirmAndInvoice(bookingId, payment_ref);
  } else if (status === "failed") {
    await prisma.payment.update({
      where: { bookingId },
      data: { status: "FAILED" },
    });
  }

  return res.sendStatus(200);
});

// ── Shared helper: confirm payment + update booking + generate invoice
// This runs inside a transaction — all three operations succeed or all fail.
async function confirmAndInvoice(bookingId: string, providerRef?: string) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { bookingId },
      data: { status: "PAID", paidAt: new Date(), ...(providerRef ? { providerRef } : {}) },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", paymentStatus: "PAID" },
    });

    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (booking) {
      const invoiceCount = await tx.invoice.count();
      const invoiceNumber = `EJR-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, "0")}`;

      // TVA = 19%
      // amountHT = total / 1.19 (extract the pre-tax amount)
      const total     = Number(booking.totalPrice);
      const amountHT  = total / 1.19;
      const tva       = total - amountHT;

      await tx.invoice.upsert({
        where: { bookingId },
        create: { bookingId, invoiceNumber, amountHT, tva, total },
        update: {},
      });
    }
  });

  console.log(`[Payment] Booking ${bookingId.slice(0, 8)} confirmed + invoice generated`);
}

router.get("/invoice/:bookingId", authMiddleware, async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.bookingId },
    include: {
      invoice: true,
      property: { select: { title: true, city: true } },
      guest: { select: { fullName: true, phone: true, email: true } },
    },
  });

  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const isGuest = booking.guestId === req.user!.id;
  if (!isGuest && req.user!.role !== "HOST" && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!booking.invoice) {
    return res.status(404).json({ error: "Invoice not yet generated (payment not confirmed)" });
  }

  return res.json(booking);
});

export default router;