import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/db/products";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const products = await listAllProducts();
    return jsonResponse({ products });
  } catch {
    return errorResponse("Failed to fetch products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const product = await createProduct(body);
    return jsonResponse({ product }, 201);
  } catch {
    return errorResponse("Failed to create product", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return errorResponse("_id required");

    const product = await updateProduct(_id, updates);
    if (!product) return errorResponse("Product not found", 404);

    return jsonResponse({ product });
  } catch {
    return errorResponse("Failed to update product", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return errorResponse("id required");

    await deleteProduct(id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Failed to delete product", 500);
  }
}
