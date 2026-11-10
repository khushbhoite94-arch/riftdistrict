import { requireAdmin } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { listCustomers } from "@/lib/db/users";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const customers = await listCustomers();
    return jsonResponse({ customers });
  } catch {
    return errorResponse("Failed to fetch customers", 500);
  }
}
