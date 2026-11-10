"use client";

import { motion } from "framer-motion";

interface StockCountdownProps {
  stock: number;
  threshold?: number;
}

export function StockCountdown({ stock, threshold = 10 }: StockCountdownProps) {
  if (stock > threshold) return null;

  const getUrgencyColor = () => {
    if (stock <= 3) return "text-red-400";
    if (stock <= 5) return "text-orange-400";
    return "text-yellow-400";
  };

  const getProgressColor = () => {
    if (stock <= 3) return "bg-red-400";
    if (stock <= 5) return "bg-orange-400";
    return "bg-yellow-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 glass-card rounded-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${getUrgencyColor()}`}>
          {stock <= 3 ? "🔥 Almost Gone!" : stock <= 5 ? "⚡ Low Stock" : "⏰ Limited Stock"}
        </p>
        <span className="text-xs text-rift-mist/60">Only {stock} left</span>
      </div>
      <div className="w-full h-1.5 bg-rift-surface rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(stock / threshold) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${getProgressColor()}`}
        />
      </div>
    </motion.div>
  );
}