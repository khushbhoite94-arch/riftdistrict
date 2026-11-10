import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getAllPendingTransactions,
  getPendingTransactionsForOrder,
  getEligiblePendingTransactions,
} from "@/lib/db/loyalty";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const orderId = searchParams.get("orderId");

    if (type === "pending" && orderId) {
      const txns = await getPendingTransactionsForOrder(orderId);
      return jsonResponse({ pending: txns });
    }

    if (type === "pending") {
      const txns = await getAllPendingTransactions();
      return jsonResponse({ pending: txns });
    }

    if (type === "eligible") {
      const eligible = await getEligiblePendingTransactions();
      return jsonResponse({ eligible });
    }

    return errorResponse("Missing type parameter. Use ?type=pending or ?type=eligible");
  } catch {
    return errorResponse("Failed to fetch loyalty data", 500);
  }
}
