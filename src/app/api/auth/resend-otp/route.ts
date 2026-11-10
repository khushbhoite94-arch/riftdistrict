import { NextRequest, NextResponse } from "next/server";

import { getAuthByEmail, setUserOtp } from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const account = await getAuthByEmail(email);

    // Only (re)send for an existing, still-unverified account. Respond
    // generically either way to avoid leaking which emails are registered.
    if (account && !account.isVerified) {
      const otp = generateOtp();
      await setUserOtp(account._id, await hashOtp(otp), otpExpiry());
      await sendVerificationEmail({ name: account.name, email: account.email }, otp);
    }

    return NextResponse.json({
      success: true,
      message: "If the account exists and is unverified, a new code has been sent.",
    });
  } catch (error) {
    console.log("RESEND-OTP ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
