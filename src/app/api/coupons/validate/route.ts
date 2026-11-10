import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { findActiveCouponByCode } from "@/lib/db/coupons";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return errorResponse("Coupon code required");

    const coupon = await findActiveCouponByCode(code);

    if (!coupon) return errorResponse("Invalid coupon code", 404);
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return errorResponse("Coupon has expired");
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return errorResponse("Coupon usage limit reached");
    }
    if (subtotal < coupon.minOrder) {
      return errorResponse(`Minimum order of $${coupon.minOrder} required`);
    }

    const discount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    return jsonResponse({
      valid: true,
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch {
    return errorResponse("Failed to validate coupon", 500);
  }
}
