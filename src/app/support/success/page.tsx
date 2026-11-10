"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function SupportSuccessPage() {
  const requestId = `RDS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card--strong p-12 rounded-3xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-rift-orange/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-rift-orange" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Request Submitted</h1>
          <p className="text-rift-mist/60 mb-8 max-w-md mx-auto">
            Your request has been received and is under review. Our team will get back to you shortly.
          </p>

          <div className="mb-8">
            <p className="text-xs text-rift-mist/50 uppercase tracking-wider">Reference ID</p>
            <p className="text-2xl font-mono mt-2 text-rift-orange">{requestId}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton href="/profile">
              Return to Orders
            </AnimatedButton>
            <AnimatedButton href="/shop" variant="glass">
              Continue Shopping <ArrowRight size={16} />
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}