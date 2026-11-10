import { NextRequest } from "next/server";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/lib/db/products";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getDemoProductBySlug } from "@/lib/demo-products";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      const demo = getDemoProductBySlug(slug);
      if (demo) return jsonResponse(demo);
      return errorResponse("Product not found", 404);
    }

    const [reviews, related] = await Promise.all([
      getProductReviews(product._id, 10),
      getRelatedProducts(product.category, product._id, 4),
    ]);

    return jsonResponse({ product, reviews, related });
  } catch (err) {
    console.warn("Product GET — using demo catalog:", err);
    const demo = getDemoProductBySlug(slug);
    if (demo) return jsonResponse(demo);
    return errorResponse("Product not found", 404);
  }
}
