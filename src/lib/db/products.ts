import { query } from "@/lib/sql";
import type { IProduct, IReview } from "@/types";
import type { ProductQuery } from "@/lib/demo-products";
import { slugify } from "@/lib/utils";

const PRODUCT_COLUMNS = `
  id AS [_id], name, slug, description, price,
  compare_at_price AS compareAtPrice, category, [collection],
  images, sizes, colors, tags, stock, featured,
  best_seller AS bestSeller, limited_drop AS limitedDrop,
  sales_rank AS salesRank, rating, review_count AS reviewCount,
  created_at AS createdAt`;

interface ProductRecord {
  images: string;
  sizes: string;
  colors: string;
  tags: string;
  [key: string]: unknown;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapProduct(row: ProductRecord): IProduct {
  return {
    ...(row as unknown as IProduct),
    images: parseJsonArray(row.images),
    sizes: parseJsonArray(row.sizes),
    colors: parseJsonArray(row.colors),
    tags: parseJsonArray(row.tags),
  };
}

const SORT_MAP: Record<string, string> = {
  newest: "created_at DESC",
  price_asc: "price ASC",
  price_desc: "price DESC",
  popular: "review_count DESC",
};

const GUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isGuid(value: string): boolean {
  return GUID_RE.test(value);
}

export async function listProducts(
  q: ProductQuery
): Promise<{ products: IProduct[]; total: number }> {
  const where: string[] = [];
  const params: Record<string, unknown> = {};

  if (q.category) {
    where.push("category = @category");
    params.category = q.category;
  }
  if (q.collection) {
    where.push("[collection] = @collection");
    params.collection = q.collection;
  }
  if (q.featured) where.push("featured = 1");
  if (q.bestSeller !== undefined) {
    where.push(`best_seller = ${q.bestSeller ? 1 : 0}`);
  }
  if (q.limitedDrop) where.push("limited_drop = 1");
  if (q.search) {
    where.push("(name LIKE @search OR tags LIKE @search)");
    params.search = `%${q.search}%`;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = SORT_MAP[q.sort ?? "newest"] ?? SORT_MAP.newest;
  const page = q.page ?? 1;
  const limit = q.limit ?? 12;

  const totalRes = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM products ${whereSql}`,
    params
  );
  const total = totalRes.recordset[0]?.n ?? 0;

  // Use TOP instead of OFFSET/FETCH for broader SQL Server compatibility
  const take = page === 1 && total <= limit ? total : limit;
  const productsRes = await query<ProductRecord>(
    page === 1
      ? `SELECT TOP (${take}) ${PRODUCT_COLUMNS} FROM products ${whereSql} ORDER BY ${orderBy}`
      : `SELECT ${PRODUCT_COLUMNS} FROM products ${whereSql}
         ORDER BY ${orderBy}
         OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY`,
    page === 1 ? params : { ...params, skip: (page - 1) * limit, take: limit }
  );

  return {
    products: productsRes.recordset.map(mapProduct),
    total,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<IProduct | null> {
  const res = await query<ProductRecord>(
    `SELECT TOP 1 ${PRODUCT_COLUMNS} FROM products WHERE slug = @slug`,
    { slug }
  );
  const row = res.recordset[0];
  return row ? mapProduct(row) : null;
}

export async function getProductById(id: string): Promise<IProduct | null> {
  if (!isGuid(id)) return null;
  const res = await query<ProductRecord>(
    `SELECT TOP 1 ${PRODUCT_COLUMNS} FROM products WHERE id = @id`,
    { id }
  );
  const row = res.recordset[0];
  return row ? mapProduct(row) : null;
}

export async function getProductsByIds(ids: string[]): Promise<IProduct[]> {
  const guidIds = ids.filter(isGuid);
  if (guidIds.length === 0) return [];
  // Portable parameterized IN list — avoids OPENJSON (needs compat level 130+).
  const params: Record<string, unknown> = {};
  const placeholders = guidIds.map((id, i) => {
    params[`id${i}`] = id;
    return `@id${i}`;
  });
  const res = await query<ProductRecord>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id IN (${placeholders.join(", ")})`,
    params
  );
  return res.recordset.map(mapProduct);
}

export async function getRelatedProducts(
  category: string,
  excludeId: string,
  take = 4
): Promise<IProduct[]> {
  const res = await query<ProductRecord>(
    `SELECT TOP (@take) ${PRODUCT_COLUMNS} FROM products
     WHERE category = @category AND id <> @excludeId
     ORDER BY created_at DESC`,
    { category, excludeId, take }
  );
  return res.recordset.map(mapProduct);
}

export async function getProductReviews(
  productId: string,
  take = 10
): Promise<IReview[]> {
  const res = await query<IReview>(
    `SELECT TOP (@take)
       id AS [_id], product_id AS productId, user_id AS userId,
       user_name AS userName, rating, comment, created_at AS createdAt
     FROM reviews WHERE product_id = @productId
     ORDER BY created_at DESC`,
    { productId, take }
  );
  return res.recordset;
}

// --- Admin CRUD ------------------------------------------------------

export async function listAllProducts(): Promise<IProduct[]> {
  const res = await query<ProductRecord>(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at DESC`
  );
  return res.recordset.map(mapProduct);
}

// Maps incoming camelCase fields to (column, value), JSON-encoding arrays.
const FIELD_MAP: Record<string, { col: string; json?: boolean }> = {
  name: { col: "name" },
  slug: { col: "slug" },
  description: { col: "description" },
  price: { col: "price" },
  compareAtPrice: { col: "compare_at_price" },
  category: { col: "category" },
  collection: { col: "[collection]" },
  images: { col: "images", json: true },
  sizes: { col: "sizes", json: true },
  colors: { col: "colors", json: true },
  tags: { col: "tags", json: true },
  stock: { col: "stock" },
  featured: { col: "featured" },
  bestSeller: { col: "best_seller" },
  limitedDrop: { col: "limited_drop" },
  salesRank: { col: "sales_rank" },
};

function toParam(value: unknown, json?: boolean): unknown {
  if (json) return JSON.stringify(Array.isArray(value) ? value : []);
  return value ?? null;
}

export async function createProduct(
  input: Record<string, unknown>
): Promise<IProduct> {
  const data = { ...input } as Record<string, unknown>;
  data.slug =
    (typeof data.slug === "string" && data.slug) || slugify(String(data.name));

  const cols: string[] = [];
  const values: string[] = [];
  const params: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    const map = FIELD_MAP[key];
    if (!map || val === undefined) continue;
    cols.push(map.col);
    values.push(`@${key}`);
    params[key] = toParam(val, map.json);
  }

  const res = await query<{ id: string }>(
    `INSERT INTO products (${cols.join(", ")})
     OUTPUT INSERTED.id AS id
     VALUES (${values.join(", ")})`,
    params
  );
  const created = await getProductById(res.recordset[0].id);
  if (!created) throw new Error("Product insert returned no row");
  return created;
}

export async function updateProduct(
  id: string,
  updates: Record<string, unknown>
): Promise<IProduct | null> {
  if (!isGuid(id)) return null;

  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  for (const [key, val] of Object.entries(updates)) {
    const map = FIELD_MAP[key];
    if (!map || val === undefined) continue;
    sets.push(`${map.col} = @${key}`);
    params[key] = toParam(val, map.json);
  }
  if (sets.length === 0) return getProductById(id);

  // No OUTPUT clause: the products AFTER UPDATE trigger forbids OUTPUT-without-INTO.
  const res = await query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = @id`,
    params
  );
  if ((res.rowsAffected[0] ?? 0) === 0) return null;
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isGuid(id)) return;
  await query(`DELETE FROM products WHERE id = @id`, { id });
}
