import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getEligiblePendingTransactions,
  creditPendingPoints,
} from "@/lib/db/loyalty";

/**
 * POST /api/cron/process-loyalty
 *
 * Processes all eligible pending loyalty transactions:
 * - Orders past the 7-day replacement window → credits points
 *
 * This endpoint is intended to be called by an external cron scheduler
 * (e.g., Vercel Cron, GitHub Actions, or any scheduled task).
 *
 * Security: Protected by CRON_SECRET environment variable.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    const eligible = await getEligiblePendingTransactions();

    if (eligible.length === 0) {
      return jsonResponse({ message: "No pending points eligible for crediting", credited: 0 });
    }

    let creditedCount = 0;
    const creditedTransactions = [];

    for (const txn of eligible) {
      const credited = await creditPendingPoints(txn.orderId!);
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
    console.error("Cron loyalty process POST:", err);
    return errorResponse("Failed to process loyalty credits", 500);
  }
}
