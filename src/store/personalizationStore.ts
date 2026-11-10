import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StylePreferences {
  fit: "slim" | "regular" | "oversized" | null;
  style: "minimal" | "bold" | "streetwear" | "premium" | null;
  colors: string[];
  priceRange: "budget" | "mid" | "premium" | null;
}

interface RecentlyViewed {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  timestamp: number;
}

interface PersonalizationState {
  hasCompletedQuiz: boolean;
  preferences: StylePreferences;
  recentlyViewed: RecentlyViewed[];
  setPreferences: (prefs: StylePreferences) => void;
  completeQuiz: () => void;
  addRecentlyViewed: (product: Omit<RecentlyViewed, "timestamp">) => void;
  clearRecentlyViewed: () => void;
}

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set) => ({
      hasCompletedQuiz: false,
      preferences: {
        fit: null,
        style: null,
        colors: [],
        priceRange: null,
      },
      recentlyViewed: [],

      setPreferences: (prefs) => set({ preferences: prefs }),

      completeQuiz: () => set({ hasCompletedQuiz: true }),

      addRecentlyViewed: (product) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((p) => p.productId !== product.productId);
          const updated = [{ ...product, timestamp: Date.now() }, ...filtered].slice(0, 10);
          return { recentlyViewed: updated };
        }),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "rift-personalization",
    }
  )
);
