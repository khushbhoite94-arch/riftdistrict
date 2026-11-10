import { NextResponse } from "next/server";
import { getAuthUser } from "./auth";
import { getUserRoleById } from "./db/users";

export function jsonResponse<T>(data: T, status = 200) {
  // Keep backwards compatibility with existing handlers that already include their own shapes.
  return NextResponse.json(data, { status });
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "SERVER_ERROR";

export function errorResponse(
  message: string,
  status = 400,
  code: ApiErrorCode = "BAD_REQUEST"
) {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      // Back-compat for older client code paths:
      error: message,
    },
    { status }
  );
}

export function okResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) return { error: errorResponse("Unauthorized", 401, "AUTH_ERROR"), user: null };
  return { error: null, user };
}

export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;

  const account = await getUserRoleById(result.user!.userId);
  if (!account || !account.isVerified || account.role !== "admin") {
    return { error: errorResponse("Forbidden", 403, "FORBIDDEN"), user: null };
  }

  return result;
}

export async function getCurrentUser() {
  return getAuthUser();
}
