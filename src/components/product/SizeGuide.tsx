"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePortal } from "@/hooks/usePortal";

interface SizeGuideProps {
  category: string;
}

const SIZE_CHARTS = {
  "oversized-tees": [
    { size: "S", chest: "106-111", length: "71", shoulder: "53" },
    { size: "M", chest: "111-116", length: "73", shoulder: "55" },
    { size: "L", chest: "116-121", length: "75", shoulder: "57" },
    { size: "XL", chest: "121-127", length: "77", shoulder: "59" },
    { size: "XXL", chest: "127-132", length: "79", shoulder: "61" },
  ],
  hoodies: [
    { size: "S", chest: "108-113", length: "68", shoulder: "54" },
    { size: "M", chest: "113-118", length: "70", shoulder: "56" },
    { size: "L", chest: "118-123", length: "72", shoulder: "58" },
    { size: "XL", chest: "123-129", length: "74", shoulder: "60" },
    { size: "XXL", chest: "129-134", length: "76", shoulder: "62" },
  ],
  sweatshirts: [
    { size: "S", chest: "106-111", length: "69", shoulder: "53" },
    { size: "M", chest: "111-116", length: "71", shoulder: "55" },
    { size: "L", chest: "116-121", length: "73", shoulder: "57" },
    { size: "XL", chest: "121-127", length: "75", shoulder: "59" },
    { size: "XXL", chest: "127-132", length: "77", shoulder: "61" },
  ],
};

export function SizeGuide({ category }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [recommendedSize, setRecommendedSize] = useState("");

  const chart = SIZE_CHARTS[category as keyof typeof SIZE_CHARTS] || SIZE_CHARTS["oversized-tees"];

  useScrollLock(isOpen);

  const calculateSize = () => {
    const h = parseInt(height);
    const w = parseInt(weight);
    if (!h || !w) return;

    if (h < 165 && w < 60) setRecommendedSize("S");
    else if (h < 170 && w < 70) setRecommendedSize("M");
    else if (h < 180 && w < 80) setRecommendedSize("L");
    else if (h < 185 && w < 90) setRecommendedSize("XL");
    else setRecommendedSize("XXL");
  };

  const portal = usePortal();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-rift-orange hover:underline tracking-wider uppercase"
      >
        Size Guide & Fit Finder
      </button>

      {portal && createPortal(<div style={{ pointerEvents: "auto" }}>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] glass-card--strong rounded-2xl z-[80] overflow-y-auto"
              >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Size Guide & Fit Finder</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Fit Finder */}
                <div className="glass-card--strong p-6 mb-8 rounded-2xl">
                  <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-4">
                    Find Your Perfect Fit
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-rift-mist/60 mb-2 block">Height (cm)</label>
                      <input
                        type="number"
                        placeholder="170"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="input-field w-full rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-rift-mist/60 mb-2 block">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="input-field w-full rounded-xl"
                      />
                    </div>
                  </div>
                  <button
                    onClick={calculateSize}
                    className="w-full px-6 py-3 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.15em] uppercase rounded-xl shadow-lg shadow-rift-orange/20"
                  >
                    Get Recommendation
                  </button>
                  {recommendedSize && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-rift-orange/10 border border-rift-orange/30 rounded-xl text-center"
                    >
                      <p className="text-sm text-rift-mist/60 mb-1">Recommended Size</p>
                      <p className="text-3xl font-bold text-rift-orange">{recommendedSize}</p>
                    </motion.div>
                  )}
                </div>

                {/* Size Chart */}
                <div>
                  <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-4">
                    Measurements (cm)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-rift-mist/10">
                          <th className="text-left py-3 px-4 text-rift-mist/60 font-medium">Size</th>
                          <th className="text-left py-3 px-4 text-rift-mist/60 font-medium">Chest</th>
                          <th className="text-left py-3 px-4 text-rift-mist/60 font-medium">Length</th>
                          <th className="text-left py-3 px-4 text-rift-mist/60 font-medium">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chart.map((row) => (
                          <tr
                            key={row.size}
                            className={`border-b border-rift-mist/5 ${
                              recommendedSize === row.size ? "bg-rift-orange/10" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-medium">{row.size}</td>
                            <td className="py-3 px-4 text-rift-mist/70">{row.chest}</td>
                            <td className="py-3 px-4 text-rift-mist/70">{row.length}</td>
                            <td className="py-3 px-4 text-rift-mist/70">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fit Notes */}
                <div className="mt-8 p-4 glass-card rounded-xl">
                  <h4 className="text-xs tracking-[0.15em] uppercase text-rift-mist/50 mb-3">Fit Notes</h4>
                  <ul className="space-y-2 text-sm text-rift-mist/60">
                    <li>• Oversized fit — designed to be worn loose</li>
                    <li>• Drop shoulder construction for relaxed silhouette</li>
                    <li>• Size down for a more fitted look</li>
                    <li>• Model is 180cm, 75kg wearing size L</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>, portal)}
    </>
  );
}