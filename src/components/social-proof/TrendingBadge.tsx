"use client";

import { motion } from "framer-motion";

interface TrendingBadgeProps {
  bestSeller?: boolean;
  salesRank?: number;
}

export function TrendingBadge({ bestSeller, salesRank }: TrendingBadgeProps) {
  if (!bestSeller || !salesRank || salesRank > 4) return null;

  return (
    <div className="absolute top-3 right-3 z-20">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-[10px] tracking-[0.2em] uppercase bg-gradient-to-r from-rift-orange to-rift-rust text-white px-3 py-1.5 rounded-full shadow-lg shadow-rift-orange/20"
      >
        Best Seller
      </motion.span>
    </div>
  );
}