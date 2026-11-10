"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { usePersonalizationStore } from "@/store/personalizationStore";
import { getPersonalizedRecommendations } from "@/lib/stylist-ai";
import type { IProduct } from "@/types";

export function PersonalStylist() {
  const { preferences, hasCompletedQuiz } = usePersonalizationStore();
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/products?limit=50");
        const data = await res.json();
        const products = data.products || [];

        const recommended = getPersonalizedRecommendations(
          preferences,
          products,
          4
        );
        setRecommendations(recommended);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasCompletedQuiz) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [preferences, hasCompletedQuiz]);

  if (!hasCompletedQuiz || recommendations.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-rift-base to-rift-surface/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rift-orange to-rift-rust flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50">
                AI Powered
              </p>
              <h2 className="text-2xl font-bold">Styled Just For You</h2>
            </div>
          </div>
          <p className="text-sm text-rift-mist/60">
            Based on your style preferences, we've curated these pieces
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-rift-surface animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
