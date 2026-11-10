"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface NewsletterSectionProps {
  compact?: boolean;
}

export function NewsletterSection({ compact }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
  };

  if (compact) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-rift-mist/10">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="input-field flex-1 rounded-xl"
          />
          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.2em] uppercase font-medium rounded-xl shadow-lg shadow-rift-orange/20 disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </motion.button>
        </form>
        {message && (
          <p className={`mt-3 text-xs ${status === "success" ? "text-rift-mist/70" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-4"
        >
          Stay Connected
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Join the District
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-rift-mist/60 text-sm mb-8 sm:mb-10"
        >
          Early access to drops, exclusive releases, and members-only content.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input-field flex-1 rounded-xl"
          />
          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.2em] uppercase font-medium rounded-xl shadow-lg shadow-rift-orange/20 whitespace-nowrap disabled:opacity-50"
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </motion.button>
        </motion.form>
        {message && (
          <p className={`mt-4 text-sm ${status === "success" ? "text-rift-mist/70" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}