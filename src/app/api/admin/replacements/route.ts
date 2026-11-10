import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  listAllReplacements,
  getReplacementById,
  updateReplacementStatus,
  updateReplacementNotes,
} from "@/lib/db/replacements";
import type { ReplacementStatus } from "@/types/replacement";
import { sendReplacementApprovedEmail, sendReplacementRejectedEmail } from "@/lib/email";
import type { ReplacementRequestRecord } from "@/lib/db/replacements";

/** Fire-and-forget approval/rejection email for a replacement case. */
function emailReplacementDecision(
  decision: "approved" | "rejected",
  record: ReplacementRequestRecord | null
): void {
  if (!record?.userEmail) return;
  const recipient = { name: record.userName || "there", email: record.userEmail };
  if (decision === "approved") {
    sendReplacementApprovedEmail(recipient, record.requestId);
  } else {
    sendReplacementRejectedEmail(recipient, record.requestId);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const replacement = await getReplacementById(id);
      if (!replacement) return errorResponse("Request not found", 404);
      return jsonResponse({ replacement });
    }

    const replacements = await listAllReplacements();
    return jsonResponse({ replacements });
  } catch (err) {
    console.error("Admin Replacements GET:", err);
    return errorResponse("Failed to fetch replacement requests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { action, replacementId, status, adminNotes, deliveryDate } = body;

    if (!action || !replacementId) {
      return errorResponse("Missing action or replacement ID");
    }

    const replacement = await getReplacementById(replacementId);
    if (!replacement) {
      return errorResponse("Request not found", 404);
    }

    if (action === "approve") {
      const updated = await updateReplacementStatus(replacementId, "approved", adminNotes ?? replacement.adminNotes ?? undefined);
      emailReplacementDecision("approved", updated);
      return jsonResponse({ replacement: updated });
    }

    if (action === "reject") {
      const updated = await updateReplacementStatus(replacementId, "rejected", adminNotes ?? "Request rejected");
      emailReplacementDecision("rejected", updated);
      return jsonResponse({ replacement: updated });
    }

    if (action === "addNotes") {
      await updateReplacementNotes(replacementId, adminNotes);
      const updated = await getReplacementById(replacementId);
      return jsonResponse({ replacement: updated });
    }

    if (action === "schedulePickup") {
      const updated = await updateReplacementStatus(replacementId, "pickup_scheduled", adminNotes, deliveryDate);
      return jsonResponse({ replacement: updated });
    }

    if (action === "markPickedUp") {
      const updated = await updateReplacementStatus(replacementId, "picked_up", adminNotes);
      return jsonResponse({ replacement: updated });
    }

    if (action === "markOutForDelivery") {
      const updated = await updateReplacementStatus(replacementId, "out_for_delivery", adminNotes);
      return jsonResponse({ replacement: updated });
    }

    if (action === "markDelivered") {
      const updated = await updateReplacementStatus(replacementId, "delivered", adminNotes, deliveryDate);
      return jsonResponse({ replacement: updated });
    }

    if (action === "updateStatus" && status) {
      const validStatuses: ReplacementStatus[] = ["pending", "approved", "rejected", "pickup_scheduled", "picked_up", "out_for_delivery", "delivered"];
      if (!validStatuses.includes(status)) {
        return errorResponse("Invalid status");
      }
      const updated = await updateReplacementStatus(replacementId, status, adminNotes, deliveryDate);
      return jsonResponse({ replacement: updated });
    }

    return errorResponse("Invalid action");
  } catch (err) {
    console.error("Admin Replacements POST:", err);
    return errorResponse("Failed to process request", 500);
  }
}