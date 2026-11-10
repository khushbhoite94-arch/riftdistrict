import { NextRequest } from "next/server";
import { getOrderByNumber } from "@/lib/db/orders";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const orderNumber = new URL(req.url).searchParams.get("order");
    if (!orderNumber) return errorResponse("Order number required");

    const order = await getOrderByNumber(orderNumber);
    if (!order) return errorResponse("Order not found", 404);

    return jsonResponse({ order });
  } catch {
    return errorResponse("Failed to fetch order", 500);
  }
}
