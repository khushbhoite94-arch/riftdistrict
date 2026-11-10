import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoyaltyTier = "Bronze" | "Silver" | "Gold";

// Store is now a thin UI cache — server DB is the single source of truth.
// addPoints / redeemPoints are removed; balance comes from /api/loyalty.
interface LoyaltyState {
  referralCode: string;
  generateReferralCode: (userId: string) => void;
}

const TIER_PERKS: Record<LoyaltyTier, string[]> = {
  Bronze: ["Earn points on purchases", "Birthday discount 5%"],
  Silver: ["1.5x points multiplier", "Birthday discount 10%", "Early access to drops"],
  Gold: ["2x points multiplier", "Birthday discount 15%", "Free shipping always", "Exclusive Gold drops"],
};

export { TIER_PERKS };

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set) => ({
      referralCode: "",
      generateReferralCode: (userId) =>
        set({ referralCode: `RIFT${userId.slice(-4).toUpperCase()}` }),
    }),
    { name: "rift-loyalty" }
  )
);
