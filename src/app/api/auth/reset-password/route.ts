import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getAuthByEmail, updateUserPassword } from "@/lib/db/users";
import { verifyOtp, isOtpExpired } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const account = await getAuthByEmail(email);
    if (!account || !account.resetOtpHash || isOtpExpired(account.resetOtpExpiry)) {
      return NextResponse.json(
        { message: "Reset code is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const valid = await verifyOtp(String(otp), account.resetOtpHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid reset code" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(account._id, hashedPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.log("RESET-PASSWORD ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
