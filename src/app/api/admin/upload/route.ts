import { NextRequest } from "next/server";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { uploadImage } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse("file required");
    if (!file.type.startsWith("image/")) {
      return errorResponse("Only image files are allowed");
    }
    if (file.size > MAX_BYTES) {
      return errorResponse("Image must be 5MB or smaller");
    }

    const folderRaw = form.get("folder");
    const folder =
      typeof folderRaw === "string" && folderRaw ? folderRaw : undefined;

    const url = await uploadImage(file, folder);
    return jsonResponse({ url }, 201);
  } catch {
    return errorResponse("Upload failed", 500);
  }
}
