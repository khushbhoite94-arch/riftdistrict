"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { getOutfitSuggestions } from "@/lib/stylist-ai";
import type { IProduct } from "@/types";

export function CartStylistSuggestions() {
  const { items } = useCartStore();
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/products?limit=50");
        const data = await res.json();
        const allProducts = data.products || [];

        // Convert cart items to products
        const cartProducts = items.map((item) => ({
          _id: item.productId,
          slug: item.slug,
          name: item.name,
          description: "",
          images: [item.image],
          price: item.price,
          category: "",
          sizes: [item.size],
          colors: item.color ? [item.color] : [],
          stock: 0,
          featured: false,
          bestSeller: false,
          limitedDrop: false,
          tags: [],
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        }));

        const matches = getOutfitSuggestions(cartProducts, allProducts, 4);
        setSuggestions(matches);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [items]);

  if (items.length === 0 || suggestions.length === 0) return null;

  return (
    <section className="mt-12 pt-12 border-t border-rift-mist/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rift-orange to-rift-rust flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50">
              AI Recommendation
            </p>
            <h2 className="text-xl font-bold">Complete Your Outfit</h2>
          </div>
        </div>
        <p className="text-sm text-rift-mist/60">
          These items pair perfectly with what's in your cart
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
          {suggestions.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
