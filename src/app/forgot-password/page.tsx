"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not send reset code");
        return;
      }
      setStep("reset");
      setInfo("If an account exists for that email, a reset code has been sent.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not reset password");
        return;
      }
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="absolute inset-0 pattern-grid opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md glass-card--strong rounded-3xl p-10"
      >
        {step === "request" ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-rift-mist/60 text-sm">
                Enter your email and we'll send a verification code.
              </p>
            </div>

            <form onSubmit={handleRequest} className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full rounded-xl"
                required
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
              >
                {loading ? "Sending..." : "Send Code"}
              </motion.button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-rift-mist/60 text-sm">
                Enter the code sent to <span className="text-white">{email}</span> and your new password.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-rift-slate/30 border border-rift-mist/30 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none text-white"
                required
              />

              <input
                type="password"
                placeholder="New password (min 6 characters)"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full rounded-xl"
                required
              />

              {info && <p className="text-sm text-rift-mist/60">{info}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 4 || newPassword.length < 6}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>
            </form>
          </>
        )}

        <p className="text-center text-rift-mist/50 text-sm mt-6">
          Remembered it?{" "}
          <Link href="/login" className="text-rift-orange hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}