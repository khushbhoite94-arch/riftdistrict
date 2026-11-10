import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

/** OTP lifetime: 10 minutes, per spec. */
export const OTP_TTL_MS = 10 * 60 * 1000;

/** Generate a random 4-digit numeric OTP (zero-padded, e.g. "0427"). */
export function generateOtp(): string {
  return randomInt(0, 10_000).toString().padStart(4, "0");
}

/** Hash an OTP before storage (never store the raw code). */
export function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/** Compare a submitted OTP against a stored hash. */
export function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/** Expiry timestamp for a freshly issued OTP. */
export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

/** True when an expiry timestamp has passed (or is missing). */
export function isOtpExpired(expiry: Date | string | null | undefined): boolean {
  if (!expiry) return true;
  return new Date(expiry).getTime() < Date.now();
}
