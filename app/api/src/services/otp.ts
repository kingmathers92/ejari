import { redis } from "./redis";


const OTP_EXPIRY_SECONDS = 300;
const MAX_WRONG_ATTEMPTS = 5;
const RATE_WINDOW_SECONDS = 60;
const MAX_SENDS_PER_WINDOW = 3;

const keys = {
  code: (phone: string) => `otp:code:${phone}`,
  attempts: (phone: string) => `otp:attempts:${phone}`,
  rateLimit: (phone: string) => `otp:rate:${phone}`,
};

export async function sendOTP(
  phone: string
): Promise<{ ok: boolean; error?: string }> {
  const sends = await redis.incr(keys.rateLimit(phone));
  if (sends === 1) {
    await redis.expire(keys.rateLimit(phone), RATE_WINDOW_SECONDS);
  }
  if (sends > MAX_SENDS_PER_WINDOW) {
    return { ok: false, error: "Too many requests. Please wait 1 minute." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await redis.set(keys.code(phone), code, "EX", OTP_EXPIRY_SECONDS);

  await redis.del(keys.attempts(phone));

  if (process.env.NODE_ENV === "development") {
    console.log(`\n  📱 OTP for ${phone}: ${code}\n`);
  } else {
    // TODO: plug in SMS provider
    // await twilioClient.messages.create({
    //   to: phone,
    //   from: process.env.TWILIO_NUMBER,
    //   body: `Your Ejarni code: ${code}. Valid for 5 minutes.`,
    // });
  }

  return { ok: true };
}

export async function verifyOTP(
  phone: string,
  inputCode: string
): Promise<{ ok: boolean; error?: string }> {
  const storedCode = await redis.get(keys.code(phone));

  if (!storedCode) {
    return { ok: false, error: "Code expired or not found. Request a new one." };
  }

  if (storedCode !== inputCode) {
    const attempts = await redis.incr(keys.attempts(phone));

    if (attempts === 1) {
      await redis.expire(keys.attempts(phone), OTP_EXPIRY_SECONDS);
    }

    if (attempts >= MAX_WRONG_ATTEMPTS) {
      await redis.del(keys.code(phone));
      await redis.del(keys.attempts(phone));
      return { ok: false, error: "Too many failed attempts. Request a new code." };
    }

    const remaining = MAX_WRONG_ATTEMPTS - attempts;
    return { ok: false, error: `Incorrect code. ${remaining} attempts remaining.` };
  }

  await redis.del(keys.code(phone));
  await redis.del(keys.attempts(phone));
  return { ok: true };
}
