/** Brand color palette */
export const PALETTE = {
  base: "#1A2730",
  surface: "#424048",
  slate: "#45586C",
  mist: "#B0CEE2",
  rust: "#A63E1B",
  orange: "#E95D2C",
} as const;

export const BRAND = {
  name: "RIFT DISTRICT",
  tagline: "Luxury Streetwear Redefined",
  description:
    "Modern luxury streetwear. Oversized silhouettes, acid wash fashion, underground culture.",
};

export const CATEGORIES = [
  { name: "Oversized Tees", slug: "oversized-tees" },
  { name: "Acid Wash", slug: "acid-wash" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Sweatshirts", slug: "sweatshirts" },
  { name: "Limited Drop", slug: "limited-drop" },
] as const;

export const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"] as const;

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
] as const;

// Placeholder product images (Unsplash fashion/streetwear)
export const PLACEHOLDER_IMAGES = {
  hero: "https://images.unsplash.com/photo-1552374196-1ab2a93c36f2?w=1920&q=80",
  product1: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  product2: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  product3: "https://images.unsplash.com/photo-1618354691373-d851c5c3f990?w=800&q=80",
  product4: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
  product5: "https://images.unsplash.com/photo-1583743814966-6a8c0549ce32?w=800&q=80",
  product6: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
  about: "https://images.unsplash.com/photo-1441984904996-e0b6a778b4de?w=1200&q=80",
  collection: "https://images.unsplash.com/photo-1469334031218-e342a42baf8b?w=1200&q=80",
};

export const INSTAGRAM_FEED = [
  PLACEHOLDER_IMAGES.product1,
  PLACEHOLDER_IMAGES.product2,
  PLACEHOLDER_IMAGES.product3,
  PLACEHOLDER_IMAGES.product4,
  PLACEHOLDER_IMAGES.product5,
  PLACEHOLDER_IMAGES.product6,
];
