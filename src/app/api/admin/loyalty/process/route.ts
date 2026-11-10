import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getEligiblePendingTransactions, creditPendingPoints } from "@/lib/db/loyalty";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
    console.error("Admin loyalty process POST:", err);
    return errorResponse("Failed to process loyalty credits", 500);
  }
}
