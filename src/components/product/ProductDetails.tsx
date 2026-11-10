"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailsProps {
  category: string;
}

const CARE_INSTRUCTIONS: Record<string, string[]> = {
  "oversized-tees": ["Machine wash cold (30°C)", "Do not bleach", "Tumble dry low", "Iron on reverse side", "Do not dry clean"],
  hoodies: ["Machine wash cold (30°C)", "Do not bleach", "Tumble dry low heat", "Do not iron print", "Wash inside out"],
  sweatshirts: ["Machine wash cold (30°C)", "Do not bleach", "Tumble dry low", "Iron on reverse", "Wash inside out"],
  "acid-wash": ["Hand wash recommended", "Cold water only", "Do not bleach", "Lay flat to dry", "Wash separately first wash"],
  "limited-drop": ["Hand wash cold", "Do not bleach", "Lay flat to dry", "Do not iron graphic", "Store folded"],
};

const STYLING_TIPS: Record<string, string[]> = {
  "oversized-tees": ["Tuck front into wide-leg trousers for a clean silhouette", "Layer under an open overshirt for depth", "Pair with cargo pants and chunky sneakers", "Knot at the hem for a cropped look"],
  hoodies: ["Layer over a longline tee for a stacked look", "Pair with slim joggers to balance the volume", "Wear unzipped over a graphic tee", "Style with wide-leg denim for a relaxed fit"],
  sweatshirts: ["Pair with tailored trousers for smart-casual", "Layer under a structured jacket", "Style with biker shorts for an athleisure look", "Tuck into high-waist jeans"],
  "acid-wash": ["Let the wash be the statement — keep rest minimal", "Pair with solid black bottoms", "Layer under a denim jacket for texture play", "Style with white sneakers to pop the wash"],
  "limited-drop": ["Wear as the centrepiece — keep accessories minimal", "Pair with neutral tones to let the piece speak", "Style with clean white sneakers", "Layer with a longline coat for editorial looks"],
};

const FABRIC_INFO: Record<string, { material: string; weight: string; origin: string }> = {
  "oversized-tees": { material: "100% Heavyweight Cotton", weight: "280 GSM", origin: "Made in India" },
  hoodies: { material: "80% Cotton, 20% Polyester French Terry", weight: "450 GSM", origin: "Made in India" },
  sweatshirts: { material: "80% Cotton, 20% Polyester Loopback", weight: "380 GSM", origin: "Made in India" },
  "acid-wash": { material: "100% Heavyweight Cotton", weight: "300 GSM", origin: "Made in India" },
  "limited-drop": { material: "Premium 100% Cotton", weight: "320 GSM", origin: "Made in India" },
};

const CARE_ICONS: Record<string, string> = {
  "Machine wash cold (30°C)": "🌊",
  "Hand wash recommended": "🤲",
  "Hand wash cold": "🤲",
  "Do not bleach": "🚫",
  "Tumble dry low": "🌀",
  "Tumble dry low heat": "🌀",
  "Iron on reverse side": "♨️",
  "Iron on reverse": "♨️",
  "Do not iron print": "🚫",
  "Do not iron graphic": "🚫",
  "Do not dry clean": "🚫",
  "Lay flat to dry": "📐",
  "Wash inside out": "🔄",
  "Wash separately first wash": "⚠️",
  "Cold water only": "❄️",
  "Store folded": "📦",
};

export function ProductDetails({ category }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<"care" | "styling" | "fabric">("fabric");

  const care = CARE_INSTRUCTIONS[category] || CARE_INSTRUCTIONS["oversized-tees"];
  const styling = STYLING_TIPS[category] || STYLING_TIPS["oversized-tees"];
  const fabric = FABRIC_INFO[category] || FABRIC_INFO["oversized-tees"];

  const tabs = [
    { id: "fabric", label: "Fabric & Origin" },
    { id: "care", label: "Care Guide" },
    { id: "styling", label: "Styling Tips" },
  ] as const;

  return (
    <div className="mt-10 border-t border-rift-mist/10 pt-8">
      <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs tracking-wider uppercase rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-rift-orange text-white"
                : "text-rift-mist/60 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "fabric" && (
            <div className="space-y-3">
              {[
                { label: "Material", value: fabric.material },
                { label: "Weight", value: fabric.weight },
                { label: "Origin", value: fabric.origin },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-rift-mist/5">
                  <span className="text-xs text-rift-mist/50 uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm text-rift-mist/80">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "care" && (
            <ul className="space-y-2">
              {care.map((instruction) => (
                <li key={instruction} className="flex items-center gap-3 text-sm text-rift-mist/70">
                  <span>{CARE_ICONS[instruction] || "•"}</span>
                  {instruction}
                </li>
              ))}
            </ul>
          )}

          {activeTab === "styling" && (
            <ul className="space-y-3">
              {styling.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-rift-mist/70">
                  <span className="text-rift-orange mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
