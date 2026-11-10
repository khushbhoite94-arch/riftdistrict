import { NextRequest, NextResponse } from "next/server";

import { getAuthByEmail, setUserResetOtp } from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const account = await getAuthByEmail(email);

    // Send only if the account exists, but always respond generically so we
    // don't reveal which emails are registered.
    if (account) {
      const otp = generateOtp();
      await setUserResetOtp(account._id, await hashOtp(otp), otpExpiry());
      await sendPasswordResetEmail({ name: account.name, email: account.email }, otp);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    console.log("FORGOT-PASSWORD ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
