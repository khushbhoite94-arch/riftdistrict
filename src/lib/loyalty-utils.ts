export interface LoyaltyRedemptionPlan {
  pointsToRedeem: number;
  discount: number;
  error?: string;
}

export function calculateLoyaltyRedemption(requestedPoints: number, availablePoints: number): LoyaltyRedemptionPlan {
  if (!requestedPoints || requestedPoints <= 0) {
    return { pointsToRedeem: 0, discount: 0 };
  }

  const safeRequestedPoints = Math.max(0, Math.floor(requestedPoints));
  const roundedDown = safeRequestedPoints - (safeRequestedPoints % 100);
  const maxRedeemable = Math.max(0, Math.min(availablePoints, roundedDown));

  if (maxRedeemable < 100) {
    return {
      pointsToRedeem: 0,
      discount: 0,
      error: "You do not have enough loyalty points to redeem that amount.",
    };
  }

  if (roundedDown > availablePoints) {
    return {
      pointsToRedeem: maxRedeemable,
      discount: Math.floor(maxRedeemable / 100),
      error: "You do not have enough loyalty points to redeem that amount.",
    };
  }

  return {
    pointsToRedeem: roundedDown,
    discount: Math.floor(roundedDown / 100),
  };
}
