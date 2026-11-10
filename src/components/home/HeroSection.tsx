"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { PLACEHOLDER_IMAGES, BRAND } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[700px] flex items-center justify-center overflow-hidden px-3 sm:px-0">
      <div className="absolute inset-0">
        <Image
          src={PLACEHOLDER_IMAGES.hero}
          alt="RIFT DISTRICT Hero"
          fill
          priority
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rift-base/50 via-rift-base/75 to-rift-base" />
      </div>

      <div className="relative z-10 text-center px-2 sm:px-6 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs tracking-[0.4em] uppercase text-rift-mist/60 mb-6"
        >
          SS26 Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none glow-text"
        >
          {BRAND.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base text-rift-mist/60 tracking-[0.15em] uppercase max-w-md mx-auto"
        >
          {BRAND.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center"
        >
          <AnimatedButton href="/shop">Shop Now</AnimatedButton>
          <AnimatedButton href="/collection/limited-drop" variant="outline">
            New Drop
          </AnimatedButton>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-16 bg-gradient-to-b from-transparent via-rift-orange/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
