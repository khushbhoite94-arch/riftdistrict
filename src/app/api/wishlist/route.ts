import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getProductsByIds } from "@/lib/product-utils";
import {
  getWishlistProductIds,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/db/wishlist";

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const wishlistIds = await getWishlistProductIds(user!.userId);
    const wishlist = await getProductsByIds(wishlistIds);

    return jsonResponse({ wishlist });
  } catch (err) {
    console.error("Wishlist GET error:", err);
    return errorResponse("Failed to fetch wishlist", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { productId, action } = await req.json();
    if (!productId) return errorResponse("productId required");

    if (action === "remove") {
      await removeFromWishlist(user!.userId, productId);
    } else {
      await addToWishlist(user!.userId, productId);
    }

    const wishlistIds = await getWishlistProductIds(user!.userId);
    const wishlist = await getProductsByIds(wishlistIds);

    return jsonResponse({ wishlist });
  } catch (err) {
    console.error("Wishlist POST error:", err);
    return errorResponse("Failed to update wishlist", 500);
  }
}
