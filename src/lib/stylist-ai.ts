import type { IProduct } from "@/types";

// Style matching rules based on categories and colors
const STYLE_RULES = {
  // Category combinations that work well together
  categoryPairs: {
    "oversized-tees": ["hoodies", "sweatshirts", "acid-wash"],
    "hoodies": ["oversized-tees", "sweatshirts"],
    "sweatshirts": ["oversized-tees", "hoodies"],
    "acid-wash": ["oversized-tees", "hoodies"],
    "limited-drop": ["oversized-tees", "hoodies", "sweatshirts"],
  },

  // Color combinations that complement each other
  colorPairs: {
    Black: ["White", "Grey", "Beige", "Olive", "Navy"],
    White: ["Black", "Grey", "Navy", "Olive", "Beige"],
    Grey: ["Black", "White", "Navy", "Olive"],
    Beige: ["Black", "White", "Olive", "Navy"],
    Olive: ["Black", "White", "Beige", "Grey"],
    Navy: ["White", "Grey", "Beige"],
    Charcoal: ["White", "Grey", "Beige"],
    Stone: ["Black", "Olive", "Navy"],
    Ash: ["Black", "White", "Navy"],
  },

  // Style profiles for different aesthetics
  styleProfiles: {
    minimal: {
      colors: ["Black", "White", "Grey", "Beige"],
      categories: ["oversized-tees", "sweatshirts"],
      keywords: ["minimal", "clean", "essential", "core"],
    },
    streetwear: {
      colors: ["Black", "White", "Olive", "Charcoal"],
      categories: ["oversized-tees", "hoodies", "acid-wash"],
      keywords: ["oversized", "street", "urban", "bold"],
    },
    premium: {
      colors: ["Black", "Navy", "Ash", "Stone"],
      categories: ["limited-drop", "hoodies", "sweatshirts"],
      keywords: ["premium", "luxury", "exclusive", "limited"],
    },
  },
};

interface StylePreferences {
  fit?: "slim" | "regular" | "oversized" | null;
  style?: "minimal" | "bold" | "streetwear" | "premium" | null;
  colors?: string[];
  priceRange?: "budget" | "mid" | "premium" | null;
}

/**
 * Calculate style compatibility score between two products
 */
export function calculateStyleScore(
  product1: IProduct,
  product2: IProduct
): number {
  let score = 0;

  // Don't recommend the same product
  if (product1._id === product2._id) return 0;

  // Category compatibility (40 points)
  const compatibleCategories =
    STYLE_RULES.categoryPairs[
      product1.category as keyof typeof STYLE_RULES.categoryPairs
    ] || [];
  if (compatibleCategories.includes(product2.category)) {
    score += 40;
  }

  // Color compatibility (30 points)
  if (product1.colors && product2.colors) {
    for (const color1 of product1.colors) {
      const compatibleColors =
        STYLE_RULES.colorPairs[color1 as keyof typeof STYLE_RULES.colorPairs] ||
        [];
      for (const color2 of product2.colors) {
        if (compatibleColors.includes(color2)) {
          score += 30;
          break;
        }
      }
      if (score >= 70) break;
    }
  }

  // Price range compatibility (15 points)
  const priceDiff = Math.abs(product1.price - product2.price);
  if (priceDiff < 500) score += 15;
  else if (priceDiff < 1000) score += 10;
  else if (priceDiff < 2000) score += 5;

  // Tag/keyword matching (15 points)
  if (product1.tags && product2.tags) {
    const commonTags = product1.tags.filter((tag) =>
      product2.tags?.includes(tag)
    );
    score += Math.min(commonTags.length * 5, 15);
  }

  return score;
}

/**
 * Get complete outfit recommendations for a product
 */
export function getCompleteTheLook(
  currentProduct: IProduct,
  allProducts: IProduct[],
  limit: number = 3
): IProduct[] {
  const scored = allProducts
    .filter((p) => p._id !== currentProduct._id)
    .map((product) => ({
      product,
      score: calculateStyleScore(currentProduct, product),
    }))
    .filter((item) => item.score > 30) // Minimum compatibility threshold
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.product);
}

/**
 * Get personalized recommendations based on user preferences
 */
export function getPersonalizedRecommendations(
  preferences: StylePreferences,
  allProducts: IProduct[],
  limit: number = 8
): IProduct[] {
  const scored = allProducts.map((product) => {
    let score = 0;

    // Style profile matching (40 points)
    if (preferences.style) {
      const profile =
        STYLE_RULES.styleProfiles[
          preferences.style as keyof typeof STYLE_RULES.styleProfiles
        ];
      if (profile) {
        // Category match
        if (profile.categories.includes(product.category)) score += 20;

        // Color match
        if (product.colors) {
          const colorMatch = product.colors.some((c) =>
            profile.colors.includes(c)
          );
          if (colorMatch) score += 10;
        }

        // Keyword match
        if (product.tags) {
          const keywordMatch = product.tags.some((tag) =>
            profile.keywords.some((kw) =>
              tag.toLowerCase().includes(kw.toLowerCase())
            )
          );
          if (keywordMatch) score += 10;
        }
      }
    }

    // Color preference matching (30 points)
    if (preferences.colors && preferences.colors.length > 0 && product.colors) {
      const colorMatch = product.colors.some((c) =>
        preferences.colors!.includes(c.toLowerCase())
      );
      if (colorMatch) score += 30;
    }

    // Price range matching (20 points)
    if (preferences.priceRange) {
      const priceRanges = {
        budget: [0, 1500],
        mid: [1500, 3000],
        premium: [3000, Infinity],
      };
      const [min, max] =
        priceRanges[
          preferences.priceRange as keyof typeof priceRanges
        ] || [0, Infinity];
      if (product.price >= min && product.price <= max) score += 20;
    }

    // Boost featured and best sellers (10 points)
    if (product.featured) score += 5;
    if (product.bestSeller) score += 5;

    return { product, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Get outfit suggestions based on a cart
 */
export function getOutfitSuggestions(
  cartItems: IProduct[],
  allProducts: IProduct[],
  limit: number = 4
): IProduct[] {
  if (cartItems.length === 0) return [];

  // Calculate average style profile from cart
  const cartCategories = cartItems.map((p) => p.category);
  const cartColors = cartItems.flatMap((p) => p.colors || []);

  const scored = allProducts
    .filter((p) => !cartItems.some((cart) => cart._id === p._id))
    .map((product) => {
      let score = 0;

      // Match with cart categories
      const categoryMatch = cartCategories.some((cat) => {
        const compatible =
          STYLE_RULES.categoryPairs[
            cat as keyof typeof STYLE_RULES.categoryPairs
          ] || [];
        return compatible.includes(product.category);
      });
      if (categoryMatch) score += 40;

      // Match with cart colors
      if (product.colors) {
        const colorMatch = product.colors.some((color) =>
          cartColors.some((cartColor) => {
            const compatible =
              STYLE_RULES.colorPairs[
                cartColor as keyof typeof STYLE_RULES.colorPairs
              ] || [];
            return compatible.includes(color);
          })
        );
        if (colorMatch) score += 30;
      }

      // Price compatibility with cart average
      const avgCartPrice =
        cartItems.reduce((sum, p) => sum + p.price, 0) / cartItems.length;
      const priceDiff = Math.abs(product.price - avgCartPrice);
      if (priceDiff < 500) score += 20;
      else if (priceDiff < 1000) score += 10;

      // Boost complementary items
      if (product.featured || product.bestSeller) score += 10;

      return { product, score };
    });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Analyze user's style profile from purchase history
 */
export function analyzeStyleProfile(
  purchaseHistory: IProduct[]
): StylePreferences {
  if (purchaseHistory.length === 0) {
    return {};
  }

  // Analyze most common categories
  const categoryCount: Record<string, number> = {};
  purchaseHistory.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  // Analyze most common colors
  const colorCount: Record<string, number> = {};
  purchaseHistory.forEach((p) => {
    p.colors?.forEach((color) => {
      colorCount[color] = (colorCount[color] || 0) + 1;
    });
  });

  // Analyze price range
  const avgPrice =
    purchaseHistory.reduce((sum, p) => sum + p.price, 0) /
    purchaseHistory.length;
  let priceRange: "budget" | "mid" | "premium" | null;
  if (avgPrice < 1500) priceRange = "budget";
  else if (avgPrice < 3000) priceRange = "mid";
  else priceRange = "premium";

  // Determine style preference
  const topColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color.toLowerCase());

  let style: "minimal" | "bold" | "streetwear" | "premium" | null = "streetwear"; // default
  if (
    topColors.includes("black") &&
    topColors.includes("white") &&
    topColors.includes("grey")
  ) {
    style = "minimal";
  } else if (purchaseHistory.some((p) => p.limitedDrop)) {
    style = "premium";
  }

  return {
    style,
    colors: topColors,
    priceRange,
  };
}
