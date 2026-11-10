"use client";

import Image from "next/image";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import { motion } from "framer-motion";

export default function AboutPageClient() {
  return (
    <div className="pt-28 pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <Image src={PLACEHOLDER_IMAGES.about} alt="About RIFT DISTRICT" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-rift-base via-rift-base/80 to-rift-base/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/60 mb-4">About</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Redefining Luxury Streetwear
          </h1>
        </div>
      </section>

      {/* Brand Story */}
      <section className="max-w-4xl mx-auto px-6 py-24 space-y-8">
        <p className="text-lg text-rift-mist/80 leading-relaxed">
          It started as a distraction. Three guys, a blank canvas, and a chaotic ambition to build something of our own. No grand corporate blueprint—just pure energy, a shared obsession with street culture, and the naive belief that passion alone would carry us through.
        </p>

        <p className="text-rift-mist/60 leading-relaxed">
          We called it a passion project. We thought it would be fun.
        </p>

        <p className="text-rift-mist/60 leading-relaxed italic">
          We were wrong.
        </p>

        {/* EST. tube */}
        <div className="w-full bg-gradient-to-r from-rift-orange/20 to-rift-rust/20 rounded-full px-8 py-4 flex items-center justify-center my-8">
          <span className="text-sm tracking-[0.4em] uppercase text-rift-orange font-medium">
            EST. 2026 | RIFT DISTRICT
          </span>
        </div>

        <p className="text-rift-mist/60 leading-relaxed">
          The transition from a casual idea to a concrete reality hit us fast. The early days weren't filled with glamorous launch parties; they were defined by friction, relentless turbulence, and a steep learning curve. We faced creative gridlocks, manufacturing nightmares, logistics that broke our spirits, and the harsh realization that building a brand in the real world means constantly fighting against the current.
        </p>

        <p className="text-rift-mist/60 leading-relaxed">
          But the friction did something unexpected. It stripped away the noise and forced us to focus. The setbacks stopped being obstacles and became the very blueprint of who we are.
        </p>

        <blockquote className="border-l-2 border-rift-orange pl-6 py-2">
          <p className="text-rift-mist/80 italic text-lg">
            "Comfort breeds conformity. Turbulence creates character."
          </p>
        </blockquote>

        <p className="text-rift-mist/60 leading-relaxed">
          Rift District is the survival of that initial spark. We evolved from three guys experimenting with a dream into a collective dedicated to heavy-hitting, uncompromising streetwear.
        </p>

        <p className="text-rift-mist/80 leading-relaxed font-medium">
          We didn't just survive the turbulence. We built a brand out of it.
        </p>

        <AnimatedButton href="/shop">Explore Collection</AnimatedButton>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-px bg-rift-mist/5 max-w-7xl mx-auto px-6 mb-24">
        {[
          { title: "Premium Materials", desc: "Heavyweight cotton, premium fleece, artisan washes." },
          { title: "Limited Drops", desc: "Exclusive releases. No restocks. Move fast." },
          { title: "India-wide Shipping", desc: "Free shipping on orders over ₹999 across India." },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card--strong p-10 text-center"
          >
            <h3 className="text-lg font-medium mb-3">{item.title}</h3>
            <p className="text-sm text-rift-mist/60">{item.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
