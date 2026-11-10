import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@/types";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env var");
}

export const ACCESS_TOKEN_EXPIRES_IN = "30d";
export const REFRESH_TOKEN_EXPIRES_IN = "60d";

export interface JWTPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string; // rotation identifier (jti-like)
}

export const AUTH_COOKIE = "rift_token"; // access token (legacy name)
export const REFRESH_COOKIE = "rift_refresh";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export function newRefreshTokenId(): string {
  // Prefer random UUID-style token IDs for rotation.
  return crypto.randomUUID();
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function setAuthCookie(token: string): void {
  // Used in API routes via NextResponse
}

// Also create a function to set refresh cookie for completeness
export function setRefreshCookie(token: string): void {
  // Used in API routes via NextResponse
}

// Backwards-compatible name for older imports
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
