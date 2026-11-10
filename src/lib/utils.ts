export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  return `RD-${Date.now().toString(36).toUpperCase()}`;
}

/** 1 point per ₹1 spent. Tier multipliers applied on top. */
export function getPointsForAmount(total: number, tier: "Bronze" | "Silver" | "Gold" = "Bronze"): number {
  const multiplier = tier === "Gold" ? 2 : tier === "Silver" ? 1.5 : 1;
  return Math.floor(total * multiplier);
}
