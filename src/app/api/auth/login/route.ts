import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getAuthByEmail } from "@/lib/db/users";
import { createRefreshSession } from "@/lib/db/sessions";
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
    const { email, password } = await req.json();

    const user = await getAuthByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { message: "Wrong password" },
        { status: 400 }
      );
    }

    // Gate unverified accounts — the client routes these to OTP verification.
    if (!user.isVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email before signing in.",
          code: "EMAIL_NOT_VERIFIED",
          email: user.email,
        },
        { status: 403 }
      );
    }

    const role = (user.role as "user" | "admin") || "user";
    const token = signAccessToken({ userId: user._id, role });

    const tokenId = newRefreshTokenId();
    const refreshToken = signRefreshToken({ userId: user._id, role, tokenId });
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await createRefreshSession({
      userId: user._id,
      tokenIdHash: sha256(tokenId),
      expiresAt: refreshExpiresAt,
    });

    const response = NextResponse.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role },
    });

    response.cookies.set(AUTH_COOKIE, token, { ...AUTH_COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 });
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
