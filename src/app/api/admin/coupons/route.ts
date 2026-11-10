import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { listCoupons, createCoupon, deleteCoupon } from "@/lib/db/coupons";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const coupons = await listCoupons();
    return jsonResponse({ coupons });
  } catch {
    return errorResponse("Failed to fetch coupons", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const coupon = await createCoupon(body);
    return jsonResponse({ coupon }, 201);
  } catch {
    return errorResponse("Failed to create coupon", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return errorResponse("id required");

    await deleteCoupon(id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Failed to delete coupon", 500);
  }
}
