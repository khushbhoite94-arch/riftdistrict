"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="pt-32 pb-24 px-6 min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full border-2 border-rift-orange flex items-center justify-center mx-auto mb-8"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl"
          >
            ✓
          </motion.span>
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Order Confirmed
        </h1>
        <p className="text-rift-mist/60 text-sm mb-2">
          Thank you for shopping with RIFT DISTRICT.
        </p>
        {orderNumber && (
          <p className="text-sm text-rift-mist/80 mb-8">
            Order <span className="font-mono text-white">{orderNumber}</span>
          </p>
        )}
        <p className="text-xs text-rift-mist/40 mb-10">
          Demo payment processed successfully. You will receive a confirmation email.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <AnimatedButton href="/shop">Continue Shopping</AnimatedButton>
          <AnimatedButton href="/profile" variant="outline">
            View Orders
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-32 min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
