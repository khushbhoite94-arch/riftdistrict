import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/db/users";
import { revokeRefreshSession } from "@/lib/db/sessions";
import {
  AUTH_COOKIE,
  REFRESH_COOKIE,
  getAuthUser,
  sha256,
  verifyRefreshToken,
} from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const auth = await getAuthUser();

    if (!auth) return errorResponse("Unauthorized", 401, "AUTH_ERROR");

    const user = await getUserProfile(auth.userId);

    if (!user) return errorResponse("User not found", 404);

    return NextResponse.json({ user });
  } catch {
    return errorResponse("Failed to fetch user", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return errorResponse("Unauthorized", 401, "AUTH_ERROR");

    const body = await req.json();
    const { name, phone, address, addresses } = body;

    const user = await updateUserProfile(auth.userId, {
      name,
      phone,
      address,
      addresses,
    });

    if (!user) return errorResponse("User not found", 404);

    return jsonResponse({ user });
  } catch {
    return errorResponse("Failed to update profile", 500);
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const refreshPayload = verifyRefreshToken(refresh);
    if (refreshPayload) {
      await revokeRefreshSession(sha256(refreshPayload.tokenId));
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
