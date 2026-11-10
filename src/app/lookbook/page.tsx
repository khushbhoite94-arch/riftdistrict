"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { motion } from "framer-motion";

const LOOKS = [
  {
    id: 1,
    title: "Void Series",
    season: "SS26",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a93c36f2?w=800&q=80",
    items: ["District Void Hoodie", "Acid Wash Oversized Tee"],
    category: "hoodies",
  },
  {
    id: 2,
    title: "Underground Edit",
    season: "SS26",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3f990?w=800&q=80",
    items: ["Rift Logo Oversized Tee", "Washed Black Sweatshirt"],
    category: "oversized-tees",
  },
  {
    id: 3,
    title: "Acid District",
    season: "SS26",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    items: ["Acid Wash Oversized Tee", "Stone Wash Boxy Tee"],
    category: "acid-wash",
  },
  {
    id: 4,
    title: "Core Essentials",
    season: "SS26",
    image: "https://images.unsplash.com/photo-1583743814966-6a8c0549ce32?w=800&q=80",
    items: ["District Core Sweatshirt", "Rift Essential Tee"],
    category: "sweatshirts",
  },
  {
    id: 5,
    title: "Midnight Drop",
    season: "Limited",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
    items: ["SS26 Limited Acid Hoodie"],
    category: "limited-drop",
  },
  {
    id: 6,
    title: "Street Luxe",
    season: "SS26",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    items: ["Midnight Acid Zip Hoodie", "Rift Logo Tee"],
    category: "hoodies",
  },
];

export default function LookbookPage() {
  return (
    <div className="pt-28 pb-24">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden mb-16">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e342a42baf8b?w=1600&q=80"
          alt="Lookbook"
          fill
          className="object-cover scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rift-base via-rift-base/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <p className="text-xs tracking-[0.4em] uppercase text-rift-mist/60 mb-3">SS26 Collection</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight glow-text">Lookbook</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOOKS.map((look, i) => (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
            >
              <Image
                src={look.image}
                alt={look.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/60 mb-1">{look.season}</p>
                <h3 className="text-xl font-bold text-white mb-2">{look.title}</h3>
                <div className="space-y-1">
                  {look.items.map((item) => (
                    <p key={item} className="text-xs text-rift-mist/60">— {item}</p>
                  ))}
                </div>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/shop?category=${look.category}`}
                    className="inline-flex items-center gap-2 text-xs text-rift-orange uppercase tracking-wider"
                  >
                    Shop This Look <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <AnimatedButton href="/shop">Shop All Pieces</AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
}