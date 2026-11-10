import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getReplacementById, getReplacementByRequestId } from "@/lib/db/replacements";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id: paramId } = await params;
    const id = paramId || new URL(req.url).searchParams.get("id");
    if (!id) return errorResponse("ID required");

    // Try to find by primary ID first, then by requestId
    let replacement = await getReplacementById(id);
    if (!replacement) {
      replacement = await getReplacementByRequestId(id);
    }

    if (!replacement) {
      return errorResponse("Request not found", 404);
    }

    return jsonResponse({ replacement });
  } catch (err) {
    console.error("Admin Replacement GET:", err);
    return errorResponse("Failed to fetch request", 500);
  }
}