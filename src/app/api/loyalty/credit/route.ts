import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getEligiblePendingTransactions,
  creditPendingPoints,
} from "@/lib/db/loyalty";

/**
 * POST /api/loyalty/credit
 *
 * Processes all eligible pending loyalty transactions:
 * - Orders past the 7-day replacement window → credits points
 *
 * Can be called by:
 * - Admin manually (via admin panel)
 * - A cron job on a schedule (e.g. daily)
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const eligible = await getEligiblePendingTransactions();

    if (eligible.length === 0) {
      return jsonResponse({ message: "No pending points eligible for crediting", credited: 0 });
    }

    // Deduplicate by orderId — creditPendingPoints handles all txns for an order at once
    const uniqueOrderIds = [...new Set(eligible.map((t) => t.orderId!))];

    let creditedCount = 0;
    const creditedTransactions = [];

    for (const orderId of uniqueOrderIds) {
      const credited = await creditPendingPoints(orderId);
      if (credited.length > 0) {
        creditedCount += credited.length;
        creditedTransactions.push(...credited);
      }
    }

    return jsonResponse({
      message: `Credited ${creditedCount} pending transaction(s)`,
      credited: creditedCount,
      transactions: creditedTransactions,
    });
  } catch (err) {
    console.error("Loyalty credit POST:", err);
    return errorResponse("Failed to process loyalty credits", 500);
  }
}

/**
 * GET /api/loyalty/credit
 * Preview: returns the list of pending transactions that are eligible for crediting.
 * Useful for admin dashboard to see what will be credited.
 */
export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const eligible = await getEligiblePendingTransactions();
    return jsonResponse({ eligible, count: eligible.length });
  } catch (err) {
    console.error("Loyalty credit GET:", err);
    return errorResponse("Failed to fetch eligible transactions", 500);
  }
}