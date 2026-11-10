import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { query } from "@/lib/sql";
import {
  listAllOrders,
  getOrderByNumber,
  getOrderById,
  updateOrderStatus,
  ensureOrderGiftColumns,
} from "@/lib/db/orders";
import { getUserContactById } from "@/lib/db/users";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";
import {
  cancelPendingTransactions,
  reverseCreditedPoints,
  getPendingTransactionsForOrder,
} from "@/lib/db/loyalty";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const orderNumber = searchParams.get("number");

    await ensureOrderGiftColumns();

    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) return errorResponse("Order not found", 404);
      const contact = await getUserContactById(order.userId);
      return jsonResponse({
        order: {
          ...order,
          userContact: contact ? { name: contact.name, email: contact.email } : null,
        },
      });
    }

    const orders = await listAllOrders();
    return jsonResponse({ orders });
  } catch {
    return errorResponse("Failed to fetch orders", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { orderId, status, trackingNumber } = await req.json();
    const allowedStatuses = ["pending", "processing", "shipped", "in-orbit", "delivered", "cancelled"];
    if (
      typeof orderId !== "string" ||
      !orderId ||
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return errorResponse("A valid orderId and supported status are required", 400);
    }
    if (trackingNumber !== undefined && trackingNumber !== null &&
        (typeof trackingNumber !== "string" || trackingNumber.length > 100)) {
      return errorResponse("Tracking number must be 100 characters or fewer", 400);
    }

    const order = await updateOrderStatus(
      orderId,
      status,
      typeof trackingNumber === "string" ? trackingNumber : undefined
    );
    if (!order) return errorResponse("Order not found", 404);

    // Handle loyalty point lifecycle on status changes
    if (status === "cancelled") {
      // Cancel any pending loyalty transactions for this order
      try {
        await cancelPendingTransactions(orderId);
      } catch (loyaltyErr) {
        console.error("Loyalty cancellation skipped:", loyaltyErr);
      }

      // Reverse any credited points for this order (refund after credit)
      try {
        const creditedRes = await query<{ points: number }>(
          `SELECT ISNULL(SUM(points), 0) AS points
           FROM loyalty_transactions
           WHERE order_id = @orderId AND status = 'credited' AND type = 'earned'`,
          { orderId }
        );
        const creditedPoints = creditedRes.recordset[0]?.points ?? 0;
        if (creditedPoints > 0) {
          await reverseCreditedPoints({
            userId: order.userId,
            orderId,
            orderNumber: order.orderNumber,
            points: creditedPoints,
            description: `Points reversed for cancelled/refunded order ${order.orderNumber}`,
          });
        }
      } catch (loyaltyErr) {
        console.error("Loyalty reversal skipped:", loyaltyErr);
      }
    }

    // Fire-and-forget status emails — never block or fail the status update.
    if (status === "shipped" || status === "delivered") {
      try {
        const contact = await getUserContactById(order.userId);
        if (contact) {
          const recipient = { name: contact.name, email: contact.email };
          if (status === "shipped") {
            sendOrderShippedEmail(
              recipient,
              order.orderNumber,
              order.trackingNumber || "Will be shared shortly"
            );
          } else {
            sendOrderDeliveredEmail(recipient, order.orderNumber);
          }
        }
      } catch (mailErr) {
        console.error("Order status email skipped:", mailErr);
      }
    }

    return jsonResponse({ order });
  } catch {
    return errorResponse("Failed to update order", 500);
  }
}
