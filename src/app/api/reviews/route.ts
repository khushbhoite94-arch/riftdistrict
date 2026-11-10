import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getReviewsByProduct,
  createReview,
  recomputeProductRating,
} from "@/lib/db/reviews";
import { getUserNameById } from "@/lib/db/users";

export async function GET(req: NextRequest) {
  try {
    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) return errorResponse("productId required");

    const reviews = await getReviewsByProduct(productId);
    return jsonResponse({ reviews });
  } catch {
    return errorResponse("Failed to fetch reviews", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { productId, rating, comment } = await req.json();
    if (!productId || !rating || !comment) {
      return errorResponse("productId, rating, and comment required");
    }

    const userName = await getUserNameById(user!.userId);
    if (!userName) return errorResponse("User not found", 404);

    const review = await createReview({
      productId,
      userId: user!.userId,
      userName,
      rating,
      comment,
    });

    await recomputeProductRating(productId);

    return jsonResponse({ review }, 201);
  } catch {
    return errorResponse("Failed to create review", 500);
  }
}
