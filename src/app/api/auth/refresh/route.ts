import { NextRequest, NextResponse } from "next/server";
import { rotateRefreshSession } from "@/lib/db/sessions";
import { getUserRoleById } from "@/lib/db/users";
import {
  signAccessToken,
  signRefreshToken,
  newRefreshTokenId,
  sha256,
  verifyRefreshToken,
  AUTH_COOKIE,
  REFRESH_COOKIE,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth";

const ACCESS_MAX_AGE = 30 * 24 * 60 * 60;
const REFRESH_MAX_AGE = 60 * 24 * 60 * 60;

function unauthorized() {
  const response = NextResponse.json(
    { message: "Refresh session is invalid or expired. Please sign in again." },
    { status: 401 }
  );
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!token) return unauthorized();

    const payload = verifyRefreshToken(token);
    if (!payload?.userId || !payload?.tokenId || !payload?.role) {
      return unauthorized();
    }

    const account = await getUserRoleById(payload.userId);
    if (!account || !account.isVerified || account.role !== payload.role) {
      return unauthorized();
    }

    const nextTokenId = newRefreshTokenId();
    const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000);
    const rotated = await rotateRefreshSession({
      currentTokenIdHash: sha256(payload.tokenId),
      userId: payload.userId,
      nextTokenIdHash: sha256(nextTokenId),
      expiresAt,
    });

    if (!rotated) return unauthorized();

    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
    });
    const refreshToken = signRefreshToken({
      userId: payload.userId,
      role: payload.role,
      tokenId: nextTokenId,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, accessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: ACCESS_MAX_AGE,
    });
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: REFRESH_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("AUTH REFRESH ERROR:", error);
    return NextResponse.json({ message: "Unable to refresh session" }, { status: 500 });
  }
}
