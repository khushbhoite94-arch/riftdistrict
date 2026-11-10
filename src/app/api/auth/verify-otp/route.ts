import { NextRequest, NextResponse } from "next/server";

import { getAuthByEmail, markUserVerified, recordOtpFailure } from "@/lib/db/users";
import { createRefreshSession } from "@/lib/db/sessions";
import { verifyOtp, isOtpExpired } from "@/lib/otp";
import {
  signAccessToken,
  signRefreshToken,
  newRefreshTokenId,
  sha256,
  AUTH_COOKIE,
  REFRESH_COOKIE,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const code = String(otp ?? "");

    if (!normalizedEmail || !/^\\d{4}$/.test(code)) {
      return NextResponse.json({ message: "A valid email and four-digit code are required" }, { status: 400 });
    }

    const account = await getAuthByEmail(normalizedEmail);
    if (!account) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    if (account.isVerified) {
      return NextResponse.json({ message: "Account already verified" }, { status: 400 });
    }

    if (account.otpLockedUntil && new Date(account.otpLockedUntil).getTime() > Date.now()) {
      return NextResponse.json(
        { message: "Too many incorrect attempts. Request a new code after the lock expires." },
        { status: 429 }
      );
    }

    if (!account.otpHash || isOtpExpired(account.otpExpiry)) {
      return NextResponse.json(
        { message: "Verification code has expired. Request a new one." },
        { status: 400 }
      );
    }

    const valid = await verifyOtp(code, account.otpHash);
    if (!valid) {
      const attempt = await recordOtpFailure(account._id);
      if (attempt.lockedUntil) {
        return NextResponse.json(
          { message: "Too many incorrect attempts. Request a new verification code in 15 minutes." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { message: "Invalid verification code", attemptsRemaining: Math.max(0, 5 - attempt.attempts) },
        { status: 400 }
      );
    }

    const markedVerified = await markUserVerified(account._id, account.otpHash);
    if (!markedVerified) {
      return NextResponse.json(
        { message: "Verification code is no longer valid. Request a new code." },
        { status: 409 }
      );
    }

    // Verified — log the user in (mirror the login token/session flow).
    const role = (account.role as "user" | "admin") || "user";
    const token = signAccessToken({ userId: account._id, role });

    const tokenId = newRefreshTokenId();
    const refreshToken = signRefreshToken({ userId: account._id, role, tokenId });
    const refreshExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await createRefreshSession({
      userId: account._id,
      tokenIdHash: sha256(tokenId),
      expiresAt: refreshExpiresAt,
    });

    const response = NextResponse.json({
      success: true,
      user: { _id: account._id, name: account.name, email: account.email, role },
    });

    response.cookies.set(AUTH_COOKIE, token, { ...AUTH_COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 });
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.log("VERIFY-OTP ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
