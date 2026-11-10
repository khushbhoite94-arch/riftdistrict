import { NextRequest, NextResponse } from "next/server";
import { getAuthByEmail, setUserOtp } from "@/lib/db/users";
import { generateOtp, hashOtp, otpExpiry, isOtpExpired } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const account = await getAuthByEmail(email);
    if (!account || account.isVerified) {
      return NextResponse.json({
        success: true,
        message: "If this account requires verification, a new code can be requested.",
      });
    }

    if (account.otpLockedUntil && new Date(account.otpLockedUntil).getTime() > Date.now()) {
      return NextResponse.json(
        { message: "Too many incorrect attempts. Try again after the lock expires." },
        { status: 429 }
      );
    }

    // An active code is already valid for ten minutes. This also limits
    // repeated resend requests without introducing a new rate-limit service.
    if (account.otpHash && !isOtpExpired(account.otpExpiry)) {
      return NextResponse.json(
        { message: "A verification code is already active. Check your email or wait for it to expire." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    await setUserOtp(account._id, await hashOtp(otp), otpExpiry());
    await sendVerificationEmail({ name: account.name, email: account.email }, otp);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json({ message: "Unable to send verification code" }, { status: 500 });
  }
}
