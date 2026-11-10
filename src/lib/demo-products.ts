import type { IProduct } from "@/types";

/** Demo catalog — used when the database is unavailable (local dev) */
export const DEMO_PRODUCTS: IProduct[] = [];

export interface ProductQuery {
  category?: string | null;
  collection?: string | null;
  featured?: boolean;
  bestSeller?: boolean;
  limitedDrop?: boolean;
  search?: string | null;
  sort?: string;
  page?: number;
  limit?: number;
}

export function queryDemoProducts(query: ProductQuery) {
  let results = [...DEMO_PRODUCTS];

  if (query.category) {
    results = results.filter((p) => p.category === query.category);
  }
  if (query.collection) {
    results = results.filter(
      (p) => p.collection === query.collection || p.category === query.collection
    );
  }
  if (query.featured) results = results.filter((p) => p.featured);
  if (query.bestSeller) results = results.filter((p) => p.bestSeller);
  if (query.limitedDrop) results = results.filter((p) => p.limitedDrop);
  if (query.search) {
    const q = query.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (query.sort) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      results.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      break;
  }

  const page = query.page || 1;
  const limit = query.limit || 12;
  const total = results.length;
  const start = (page - 1) * limit;
  const products = results.slice(start, start + limit);

  return {
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export function getDemoProductBySlug(_slug: string) {
 return null;
}

export function getDemoHomeProducts() {
 return {
 featured: [],
 bestSellers: [],
 trending: [],
 };
}