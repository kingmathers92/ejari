import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { sendOTP, verifyOTP } from "../services/otp";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

function createToken(user: { id: string; phone: string; role: string }) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );
}

router.post("/request-otp", async (req: Request, res: Response) => {
  const { phone } = req.body;

  // phone validation
  if (!phone || !/^\+?[0-9]{8,15}$/.test(String(phone))) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const result = await sendOTP(String(phone));

  if (!result.ok) {
    return res.status(429).json({ error: result.error });
  }

  return res.json({ message: "OTP sent" });
});


router.post("/verify-otp", async (req: Request, res: Response) => {
  const { phone, code, fullName } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: "phone and code are required" });
  }

  const result = await verifyOTP(String(phone), String(code));
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  // look up the user by phone
  let user = await prisma.user.findUnique({ where: { phone: String(phone) } });

  if (!user) {
    // New user — fullName is required for account creation
    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({
        error: "Full name is required for new accounts (minimum 2 characters)",
      });
    }
    user = await prisma.user.create({
      data: {
        phone: String(phone),
        fullName: String(fullName).trim(),
      },
    });
  }

  const token = createToken({ id: user.id, phone: user.phone, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    },
  });
});


router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      role: true,
      idVerified: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

router.patch("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { fullName, email } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(fullName ? { fullName: String(fullName).trim() } : {}),
      ...(email ? { email: String(email).toLowerCase().trim() } : {}),
    },
    select: { id: true, fullName: true, phone: true, email: true, role: true },
  });

  return res.json(updated);
});


router.post("/become-host", authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: "HOST" },
  });

  const token = createToken({ id: user.id, phone: user.phone, role: user.role });
  return res.json({ token, user: { id: user.id, role: user.role } });
});

export default router;