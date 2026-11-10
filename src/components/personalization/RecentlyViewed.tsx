"use client";

import { usePersonalizationStore } from "@/store/personalizationStore";
import { ProductCard } from "@/components/shop/ProductCard";
import { useEffect, useState } from "react";
import type { IProduct } from "@/types";

export function RecentlyViewed() {
  const { recentlyViewed } = usePersonalizationStore();
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    if (recentlyViewed.length === 0) return;
    const mapped = recentlyViewed.map((rv) => ({
      _id: rv.productId,
      slug: rv.slug,
      name: rv.name,
      description: "",
      images: [rv.image],
      price: rv.price,
      category: "",
      sizes: [],
      colors: [],
      stock: 0,
      featured: false,
      bestSeller: false,
      limitedDrop: false,
      tags: [],
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }));
    setProducts(mapped);
  }, [recentlyViewed]);

  if (products.length === 0) return null;

  return (
    <section className="py-16 px-6 border-t border-rift-mist/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 5).map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
