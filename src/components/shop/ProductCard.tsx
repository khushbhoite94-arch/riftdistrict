"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { TrendingBadge } from "@/components/social-proof/TrendingBadge";
import type { IProduct } from "@/types";
import { Eye } from "lucide-react";

interface ProductCardProps {
  product: IProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  if (!product) return null;
  const imgSrc = product.images?.[0] || "/placeholder.jpg";
  const isFileUrl = imgSrc.startsWith("file://");

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} data-cursor>
        <div className="glass-card--strong relative aspect-[3/4] overflow-hidden mb-3 sm:mb-4">
          <TrendingBadge
            bestSeller={product.bestSeller}
            salesRank={product.salesRank}
          />
          {isFileUrl ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-rift-base/90 via-rift-base/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-rift-mist/90 glass-card px-4 py-2 rounded-xl">
              <Eye size={14} />
              Quick View
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-rift-mist/50">
            {product.category.replace(/-/g, " ")}
          </p>
          <h3 className="text-sm sm:text-[0.95rem] font-medium text-white group-hover:text-rift-orange transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-rift-orange">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-rift-mist/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}