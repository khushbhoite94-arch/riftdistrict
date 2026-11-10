"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const renderImg = (src: string, alt: string, className: string, sizes?: string, priority?: boolean) => {
    if (src.startsWith("file://")) {
      return (
        <img src={src} alt={alt} className={`absolute inset-0 w-full h-full ${className}`} />
      );
    }
    return <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!zoomed) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !zoomed) return;
    setPanPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleZoom = () => {
    if (zoomed) {
      setZoomed(false);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomed(true);
    }
  };

  useScrollLock(fullscreen);

  const nextImage = () => setActive((active + 1) % images.length);
  const prevImage = () => setActive((active - 1 + images.length) % images.length);

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative">
          <div
            className={`relative aspect-[3/4] bg-rift-surface rounded-2xl overflow-hidden ${
              zoomed ? "cursor-move" : "cursor-zoom-in"
            }`}
            onClick={toggleZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{
                  transform: zoomed
                    ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
                    : "scale(1)",
                  transition: isDragging ? "none" : "transform 0.3s ease-out",
                }}
              >
                {renderImg(
                  images[active],
                  `${name} - image ${active + 1}`,
                  "object-cover",
                  "(max-width: 768px) 100vw, 50vw",
                  true
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {images.length > 1 && !zoomed && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass-card text-white text-xs">
                {active + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
            aria-label="View fullscreen"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-xl transition-all ${
                  active === i ? "border-2 border-rift-orange scale-105" : "border border-rift-mist/15 hover:border-rift-mist/40"
                }`}
              >
                {renderImg(img, "", "object-cover", "80px")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <X size={20} />
            </button>

            <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center px-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderImg(images[active], `${name} fullscreen`, "object-contain", "90vw")}
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-6 w-14 h-14 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-6 w-14 h-14 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors z-10"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-card text-white text-sm">
              {active + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}