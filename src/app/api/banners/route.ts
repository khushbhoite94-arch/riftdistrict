import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getActiveBanners } from "@/lib/db/banners";

export async function GET() {
  try {
    const banners = await getActiveBanners();
    return jsonResponse({ banners });
  } catch {
    return errorResponse("Failed to fetch banners", 500);
  }
}
