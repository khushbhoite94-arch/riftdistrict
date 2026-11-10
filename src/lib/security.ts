import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-helpers";

export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  // Browsers set Origin for CORS + most POST requests; same-origin POST should match.
  if (!origin) return null;

  const allowed = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  if (origin !== allowed) {
    return errorResponse("Unauthorized", 401, "AUTH_ERROR");
  }
  return null;
}

