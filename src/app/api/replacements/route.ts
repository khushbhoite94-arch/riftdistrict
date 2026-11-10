import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { uploadImage } from "@/lib/cloudinary";
import { SIZES } from "@/lib/constants";
import {
  createReplacementRequest,
  ensureReplacementRequestsTable,
  getReplacementsByUser,
  hasActiveReplacementForOrder,
  getReplacementByRequestId,
} from "@/lib/db/replacements";
import { getUserContactById } from "@/lib/db/users";
import { sendReplacementReceivedEmail } from "@/lib/email";
import { query } from "@/lib/sql";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SIZE_VALUE_LENGTH = 50;

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const requestId = req.nextUrl.searchParams.get("requestId");
    const orderId = req.nextUrl.searchParams.get("orderId");

    if (requestId) {
      const replacement = await getReplacementByRequestId(requestId);
      if (!replacement || replacement.userId !== user!.userId) {
        return errorResponse("Request not found", 404);
      }
      return jsonResponse({ replacement });
    }

    if (orderId) {
      const replacements = await getReplacementsByUser(user!.userId);
      const orderReplacements = replacements.filter((r) => r.orderId === orderId);
      return jsonResponse({ replacements: orderReplacements });
    }

    const replacements = await getReplacementsByUser(user!.userId);
    return jsonResponse({ replacements });
  } catch (err) {
    console.error("Replacements GET:", err);
    return errorResponse("Failed to fetch requests", 500);
  }
}

function isFile(value: unknown): value is File {
  return (
    value instanceof File ||
    (value !== null && typeof value === "object" && "stream" in value)
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

async function fileToDataUri(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

async function uploadReplacementImage(file: File): Promise<string> {
  try {
    return await withTimeout(
      uploadImage(file, "riftdistrict/replacements"),
      8000,
      "Cloudinary upload"
    );
  } catch (uploadErr) {
    console.error(
      "Support image Cloudinary upload failed, using request payload image:",
      uploadErr
    );
    return fileToDataUri(file);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const user = auth.user!;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error("Replacements POST form parse error:", err);
      return errorResponse("Invalid request body");
    }

    const orderId = formData.get("orderId");
    const type = formData.get("type");
    const description = formData.get("description");
    const currentSize = formData.get("currentSize");
    const requestedSize = formData.get("requestedSize");

    if (typeof orderId !== "string" || !orderId) {
      return errorResponse("Missing order ID");
    }
    if (typeof type !== "string" || !type) {
      return errorResponse("Missing request type");
    }

    const validTypes = ["damaged", "replacement"];
    if (!validTypes.includes(type)) {
      return errorResponse("Invalid request type");
    }

    const descriptionText = typeof description === "string" ? description.trim() : "";
    const currentSizeText = typeof currentSize === "string" ? currentSize.trim() : "";
    const requestedSizeText = typeof requestedSize === "string" ? requestedSize.trim() : "";

    if (type === "damaged" && !descriptionText) {
      return errorResponse("Description is required");
    }
    if (type === "replacement" && (!currentSizeText || !requestedSizeText)) {
      return errorResponse("Please select both current and new sizes");
    }
    if (descriptionText.length > MAX_DESCRIPTION_LENGTH) {
      return errorResponse(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
      );
    }
    if (
      currentSizeText.length > MAX_SIZE_VALUE_LENGTH ||
      requestedSizeText.length > MAX_SIZE_VALUE_LENGTH
    ) {
      return errorResponse("Size values are too long");
    }
    if (currentSizeText && !SIZES.includes(currentSizeText as (typeof SIZES)[number])) {
      return errorResponse("Invalid current size");
    }
    if (requestedSizeText && !SIZES.includes(requestedSizeText as (typeof SIZES)[number])) {
      return errorResponse("Invalid requested size");
    }

    try {
      await ensureReplacementRequestsTable();
    } catch (dbErr) {
      console.error("DB replacement table bootstrap error:", dbErr);
      return errorResponse(
        "Database error - failed to prepare support requests",
        500,
        "SERVER_ERROR"
      );
    }

    let orderCheck;
    try {
      orderCheck = await query<{ status: string; created_at: string }>(
        `SELECT status, created_at FROM orders WHERE id = @orderId AND user_id = @userId`,
        { orderId, userId: user.userId }
      );
    } catch (dbErr) {
      console.error("DB query error:", dbErr);
      return errorResponse(
        "Database error - could not verify order",
        500,
        "SERVER_ERROR"
      );
    }

    if (!orderCheck.recordset[0]) {
      return errorResponse("Order not found", 404);
    }

    if (orderCheck.recordset[0].status !== "delivered") {
      return errorResponse("Only delivered orders are eligible for support requests");
    }

    const deliveredDate = new Date(orderCheck.recordset[0].created_at);
    const sevenDaysLater = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (new Date() > sevenDaysLater) {
      return errorResponse("Replacement window has closed (7 days from delivery)");
    }

    let existingActive = false;
    try {
      existingActive = await hasActiveReplacementForOrder(orderId, user.userId);
    } catch (dbErr) {
      console.error("DB active request check failed; continuing with request creation:", dbErr);
    }
    if (existingActive) {
      return errorResponse("An active request already exists for this order", 409);
    }

    const imageFiles: File[] = [];
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      const keyLower = key.toLowerCase();
      if (keyLower.startsWith("image") && isFile(value)) {
        imageFiles.push(value);
      }
    }

    if (imageFiles.length !== 3) {
      return errorResponse(`Exactly 3 images are required (got ${imageFiles.length})`);
    }

    for (const file of imageFiles) {
      const fileType = file.type;
      if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
        return errorResponse(
          `Invalid file type: ${fileType}. Allowed: jpg, jpeg, png, webp`
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return errorResponse(`File exceeds 10MB limit`);
      }
    }

    let imageUrls: string[];
    try {
      imageUrls = await Promise.all(
        imageFiles.map((file) => uploadReplacementImage(file))
      );
    } catch (uploadErr) {
      console.error("Support image processing error:", uploadErr);
      return errorResponse("Failed to process support images", 500, "SERVER_ERROR");
    }

    let replacement;
    try {
      replacement = await createReplacementRequest({
        orderId,
        userId: user.userId,
        type: type as "damaged" | "replacement",
        images: imageUrls,
        description: descriptionText || undefined,
        requestedSize: requestedSizeText || undefined,
        currentSize: currentSizeText || undefined,
      });
    } catch (dbErr) {
      console.error("DB insert error:", dbErr);
      return errorResponse(
        "Database error - failed to save request",
        500,
        "SERVER_ERROR"
      );
    }

    // Fire-and-forget "case received" email — never blocks request creation.
    try {
      const contact = await getUserContactById(user.userId);
      if (contact) {
        sendReplacementReceivedEmail(
          { name: contact.name, email: contact.email },
          replacement.requestId
        );
      }
    } catch (mailErr) {
      console.error("Replacement received email skipped:", mailErr);
    }

    return jsonResponse({ replacement }, 201);
  } catch (err) {
    console.error("Replacements POST:", err);
    return errorResponse("Failed to create request", 500, "SERVER_ERROR");
  }
}