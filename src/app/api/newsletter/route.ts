import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { isSubscribed, subscribe } from "@/lib/db/newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Valid email required");
    }

    if (await isSubscribed(email)) {
      return jsonResponse({ message: "Already subscribed" });
    }

    await subscribe(email);
    return jsonResponse({ message: "Subscribed successfully" }, 201);
  } catch {
    return errorResponse("Subscription failed", 500);
  }
}
