"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState<"login" | "otp">("login");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLogin = (user: { _id?: string; name: string; email: string; role?: string }) => {
    login(user);
    const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push(redirect);
    }
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        await fetch("/api/auth/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setStep("otp");
        setInfo("Your email isn't verified yet. We sent a fresh code.");
        return;
      }

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      finishLogin(data.user);
    } catch {
      setError("Something went wrong");
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
      finishLogin(data.user);
    } catch {
      setError("Something went wrong");
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
        {step === "login" ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-rift-mist/60 text-sm">Login to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full rounded-xl"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full rounded-xl"
                required
              />

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-rift-mist/50 hover:text-rift-mist transition"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            <p className="text-center text-rift-mist/50 text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-rift-orange hover:underline">
                Signup
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

            <p className="text-center text-rift-mist/50 text-sm mt-6">
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