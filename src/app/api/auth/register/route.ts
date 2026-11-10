import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import {
  createUser,
  emailExists,
  ensureUserAuthColumns,
  setUserOtp,
} from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    const allowedDomains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com"];
    const emailDomain = typeof email === "string" ? email.split("@").pop()?.toLowerCase() : "";
    if (!allowedDomains.includes(emailDomain || "")) {
      return NextResponse.json(
        { message: "Only Gmail, Outlook, Yahoo Mail, and iCloud Mail addresses are accepted." },
        { status: 422 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    if (await emailExists(email)) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Ensure verification columns exist so the new account starts unverified.
    await ensureUserAuthColumns();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
    });

    // Issue a 4-digit verification OTP (hashed at rest, 10-min expiry).
    const otp = generateOtp();
    await sendVerificationEmail({ name: user.name, email: user.email }, otp);
    await setUserOtp(user._id, await hashOtp(otp), otpExpiry());

    // No auth cookie: the account stays unverified until the OTP is validated.
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: user.email,
        message: "Verification code sent to your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
