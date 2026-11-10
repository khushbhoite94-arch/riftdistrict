"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import type { IProduct } from "@/types";

const COLLECTION_META: Record<string, { title: string; description: string; color: string }> = {
  "limited-drop": {
    title: "Limited Drop SS26",
    description: "Exclusive acid wash pieces. Limited quantities. No restocks.",
    color: "rift-orange",
  },
  "acid-wash": {
    title: "Acid Wash Collection",
    description: "Distressed finishes and washed textures for the underground aesthetic.",
    color: "rift-rust",
  },
  "oversized-tees": {
    title: "Oversized Tees",
    description: "Premium oversized silhouettes built for the modern street.",
    color: "rift-mist",
  },
  "hoodies": {
    title: "Hoodies",
    description: "Heavyweight comfort with signature RIFT DISTRICT details.",
    color: "rift-slate",
  },
  "sweatshirts": {
    title: "Sweatshirts",
    description: "Essential pieces for elevated casual wear.",
    color: "rift-orange",
  },
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const meta = COLLECTION_META[slug] || {
    title: slug?.replace(/-/g, " ") || "Collection",
    description: "Explore the collection.",
    color: "rift-orange",
  };

  useEffect(() => {
    if (!slug) return;
    const params = new URLSearchParams();
    if (slug === "limited-drop") {
      params.set("limitedDrop", "true");
    } else {
      params.set("category", slug);
    }
    params.set("limit", "100");
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []));
  }, [slug]);

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rift-surface to-rift-base" />
        <div className="absolute inset-0 pattern-grid opacity-10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.3em] uppercase text-rift-mist/60 mb-2"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight capitalize"
          >
            {meta.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-rift-mist/60 max-w-lg text-sm"
          >
            {meta.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-4"
          >
            <span className={`px-4 py-2 rounded-full bg-${meta.color}/10 border border-${meta.color}/30 text-${meta.color} text-xs uppercase tracking-[0.15em]`}>
              {products.length} Products
            </span>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32"
            >
              <p className="text-rift-mist/50 text-lg">No products in this collection yet.</p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}