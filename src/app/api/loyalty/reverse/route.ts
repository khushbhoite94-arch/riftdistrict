import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getPendingTransactionsForOrder,
  cancelPendingTransactions,
  reverseCreditedPoints,
} from "@/lib/db/loyalty";
import { getOrderById } from "@/lib/db/orders";
import { query } from "@/lib/sql";

/**
 * POST /api/loyalty/reverse
 * Body: { orderId }
 *
 * Handles loyalty point reversal when an order is refunded:
 * - If points are still pending → cancels them
 * - If points were already credited → creates a reversal transaction
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return errorResponse("orderId is required");
    }

    // Fetch the order to get user info and points
    const order = await getOrderById(orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Check for pending transactions first
    const pendingTxns = await getPendingTransactionsForOrder(orderId);

    if (pendingTxns.length > 0) {
      // Points are still pending → cancel them (no deduction needed)
      await cancelPendingTransactions(orderId);
      return jsonResponse({
        action: "cancelled",
        message: `${pendingTxns.length} pending transaction(s) cancelled for order ${order.orderNumber}`,
        cancelled: pendingTxns.length,
      });
    }

    // Check if there are credited transactions for this order
    const creditedRes = await query<{ points: number }>(
      `SELECT ISNULL(SUM(points), 0) AS points
       FROM loyalty_transactions
       WHERE order_id = @orderId AND status = 'credited' AND type = 'earned'`,
      { orderId }
    );

    const creditedPoints = creditedRes.recordset[0]?.points ?? 0;

    if (creditedPoints > 0) {
      // Points were already credited → create a reversal transaction
      const reversal = await reverseCreditedPoints({
        userId: order.userId,
        orderId,
        orderNumber: order.orderNumber,
        points: creditedPoints,
        description: `Points reversed for refunded order ${order.orderNumber}`,
      });

      return jsonResponse({
        action: "reversed",
        message: `${creditedPoints} points reversed for order ${order.orderNumber}`,
        reversal,
      });
    }

    return jsonResponse({
      action: "none",
      message: "No loyalty transactions found for this order",
      cancelled: 0,
    });
  } catch (err) {
    console.error("Loyalty reverse POST:", err);
    return errorResponse("Failed to process loyalty reversal", 500);
  }
}