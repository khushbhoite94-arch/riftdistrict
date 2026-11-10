import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getAnalytics } from "@/lib/db/analytics";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const analytics = await getAnalytics();
    return jsonResponse(analytics);
  } catch {
    return errorResponse("Failed to fetch analytics", 500);
  }
}
