"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCompleteTheLook } from "@/lib/stylist-ai";
import type { IProduct } from "@/types";

interface CompleteTheLookProps {
  currentProduct: IProduct;
}

export function CompleteTheLook({ currentProduct }: CompleteTheLookProps) {
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/products?limit=50");
        const data = await res.json();
        const products = data.products || [];

        const matches = getCompleteTheLook(currentProduct, products, 4);
        setSuggestions(matches);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentProduct]);

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <section className="mt-24 border-t border-rift-mist/10 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rift-orange to-rift-rust flex items-center justify-center">
            <span className="text-xl">🎨</span>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50">
              AI Stylist
            </p>
            <h2 className="text-2xl font-bold">Complete The Look</h2>
          </div>
        </div>
        <p className="text-sm text-rift-mist/60">
          Style-matched pieces that go perfectly with this item
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestions.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <ProductCard product={p} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
