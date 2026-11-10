"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/hooks/useScrollLock";

interface CustomerPhoto {
  id: string;
  image: string;
  userName: string;
  rating: number;
}

const SAMPLE_PHOTOS: CustomerPhoto[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&q=80",
    userName: "Arjun M.",
    rating: 5,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=400&q=80",
    userName: "Priya K.",
    rating: 5,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
    userName: "Rohan S.",
    rating: 4,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1583743814966-6a8c0549ce32?w=400&q=80",
    userName: "Ananya R.",
    rating: 5,
  },
];

export function CustomerPhotos() {
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);

  useScrollLock(!!selectedPhoto);

  return (
    <>
      <section className="mt-16 border-t border-rift-mist/10 pt-16">
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Community</p>
          <h2 className="text-2xl font-bold">Styled by You</h2>
          <p className="text-sm text-rift-mist/60 mt-2">
            Real customers, real fits. Tag @riftdistrict for a chance to be featured.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLE_PHOTOS.map((photo) => (
            <motion.button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <Image
                src={photo.image}
                alt={`Photo by ${photo.userName}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium">{photo.userName}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: photo.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]"
              onClick={() => setSelectedPhoto(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-[101]"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={selectedPhoto.image}
                  alt={`Photo by ${selectedPhoto.userName}`}
                  fill
                  className="object-cover"
                  sizes="90vw"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium">{selectedPhoto.userName}</p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: selectedPhoto.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}