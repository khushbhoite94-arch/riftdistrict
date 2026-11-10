"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com"];

function isAllowedEmail(email: string) {
  const domain = email.split("@").pop()?.toLowerCase() || "";
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAllowedEmail(email)) {
      setError("Please use a Gmail, Outlook, Yahoo Mail, or iCloud Mail address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      setStep("otp");
      setInfo("We sent a 4-digit verification code to your email.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      login(data.user);
      router.push("/profile");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setInfo("A new code has been sent.");
    } catch {
      setError("Could not resend the code. Try again.");
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
        {step === "signup" ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-rift-mist/60 text-sm">Join RIFT DISTRICT</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full rounded-xl"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full rounded-xl"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full rounded-xl"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
              >
                {loading ? "Creating..." : "Create Account"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-rift-mist/50 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-rift-orange hover:underline">
                Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-rift-mist/60 text-sm">
                Enter the 4-digit code sent to <span className="text-white">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-rift-slate/30 border border-rift-mist/30 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none text-white"
                  required
                />
              </div>

              {info && <p className="text-sm text-rift-mist/60">{info}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 4}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
              >
                {loading ? "Verifying..." : "Verify"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-rift-mist/50 mt-6">
              Didn't get a code?{" "}
              <button type="button" onClick={handleResend} className="text-rift-orange hover:underline">
                Resend
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}