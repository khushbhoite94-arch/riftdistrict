"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuthStore } from "@/store/authStore";

interface AuthFormProps {
  mode: "login" | "signup";
}

type Step = "credentials" | "otp";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [step, setStep] = useState<Step>("credentials");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectAfterAuth = (user: { role?: string }) => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || (user.role === "admin" ? "/admin" : "/profile");
    router.push(redirect);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      // Signup: account created unverified — move to OTP step.
      if (mode === "signup" && res.ok && data.requiresVerification) {
        setStep("otp");
        setInfo("We sent a 4-digit code to your email.");
        return;
      }

      // Login attempt on an unverified account — verify first.
      if (mode === "login" && res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        await fetch("/api/auth/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        setStep("otp");
        setInfo("Your email isn't verified yet. We sent a fresh code.");
        return;
      }

      if (!res.ok) {
        setError(data.error || data.message || "Something went wrong");
        return;
      }

      setUser(data.user);
      redirectAfterAuth(data.user);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Verification failed");
        return;
      }

      setUser(data.user);
      redirectAfterAuth(data.user);
    } catch {
      setError("Network error");
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
        body: JSON.stringify({ email: form.email }),
      });
      setInfo("A new code has been sent.");
    } catch {
      setError("Network error");
    }
  };

  if (step === "otp") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Your Email</h1>
        <p className="text-rift-mist/50 text-sm mb-8">
          Enter the 4-digit code sent to{" "}
          <span className="text-white">{form.email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="input-field text-center text-2xl tracking-[0.5em]"
          />

          {info && <p className="text-sm text-rift-mist/60">{info}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <AnimatedButton type="submit" disabled={loading || otp.length !== 4} className="w-full text-center">
            {loading ? "..." : "Verify"}
          </AnimatedButton>
        </form>

        <p className="mt-6 text-sm text-rift-mist/50 text-center">
          Didn&apos;t get a code?{" "}
          <button type="button" onClick={handleResend} className="text-white hover:underline">
            Resend
          </button>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {mode === "login" ? "Welcome Back" : "Join the District"}
      </h1>
      <p className="text-rift-mist/50 text-sm mb-8">
        {mode === "login"
          ? "Sign in to your RIFT DISTRICT account"
          : "Create your account for exclusive access"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
        />

        {mode === "login" && (
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-rift-mist/50 hover:text-white hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <AnimatedButton type="submit" disabled={loading} className="w-full text-center">
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </AnimatedButton>
      </form>

      <p className="mt-6 text-sm text-rift-mist/50 text-center">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
