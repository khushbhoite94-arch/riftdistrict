import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getLoyaltyDashboard,
  createPendingLoyaltyTransaction,
  createRedeemedTransaction,
} from "@/lib/db/loyalty";

/**
 * GET /api/loyalty
 * Returns the loyalty dashboard data for the authenticated user.
 * Includes: availablePoints, pendingPoints, lifetimeEarned,
 *            lifetimeRedeemed, lifetimeExpired, transactions[]
 */
export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const dashboard = await getLoyaltyDashboard(user!.userId);
    return jsonResponse({ dashboard });
  } catch (err) {
    console.error("Loyalty GET:", err);
    return errorResponse("Failed to fetch loyalty data", 500);
  }
}

/**
 * POST /api/loyalty
 * Body: { orderId, orderNumber, points, type }
 *
 * - type "pending"  → creates a pending loyalty transaction (called after order placement)
 * - type "redeemed" → creates a redeemed transaction (called when points are used)
 */
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { orderId, orderNumber, points, type, description } = body;

    if (!orderId || !orderNumber || !points || !type) {
      return errorResponse("Missing required fields: orderId, orderNumber, points, type");
    }

    if (typeof points !== "number" || points <= 0) {
      return errorResponse("Points must be a positive number");
    }

    if (type === "pending") {
      const txn = await createPendingLoyaltyTransaction({
        userId: user!.userId,
        orderId,
        orderNumber,
        points,
        description,
      });
      return jsonResponse({ transaction: txn }, 201);
    }

    if (type === "redeemed") {
      const txn = await createRedeemedTransaction({
        userId: user!.userId,
        orderId,
        orderNumber,
        points,
        description,
      });
      return jsonResponse({ transaction: txn }, 201);
    }

    return errorResponse("Invalid type. Use 'pending' or 'redeemed'.");
  } catch (err) {
    console.error("Loyalty POST:", err);
    return errorResponse("Failed to create loyalty transaction", 500);
  }
}