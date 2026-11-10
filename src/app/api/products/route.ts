import { NextRequest } from "next/server";
import { listProducts } from "@/lib/db/products";
import { jsonResponse } from "@/lib/api-helpers";
import { queryDemoProducts } from "@/lib/demo-products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const featured = searchParams.get("featured") === "true";
  const bestSeller = searchParams.get("bestSeller") === "true";
  const limitedDrop = searchParams.get("limitedDrop") === "true";
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const demoQuery = {
    category,
    collection,
    featured,
    bestSeller,
    limitedDrop,
    search,
    sort,
    page,
    limit,
  };

  try {
    const { products, total } = await listProducts(demoQuery);
    console.log(`[Products API] total=${total}, returned=${products.length}, query=${JSON.stringify(demoQuery)}`);

    if (total === 0) {
      return jsonResponse(queryDemoProducts(demoQuery));
    }

    return jsonResponse({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.warn("Products GET — using demo catalog:", err);
    return jsonResponse(queryDemoProducts(demoQuery));
  }
}
