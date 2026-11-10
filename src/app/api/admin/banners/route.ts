import { NextRequest } from "next/server";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import {
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/lib/db/banners";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const banners = await listAllBanners();
    return jsonResponse({ banners });
  } catch {
    return errorResponse("Failed to fetch banners", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const banner = await createBanner(body);
    return jsonResponse({ banner }, 201);
  } catch {
    return errorResponse("Failed to create banner", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return errorResponse("id required");

    await deleteBanner(id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Failed to delete banner", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return errorResponse("_id required");

    const banner = await updateBanner(_id, updates);
    if (!banner) return errorResponse("Banner not found", 404);

    return jsonResponse({ banner });
  } catch {
    return errorResponse("Failed to update banner", 500);
  }
}
