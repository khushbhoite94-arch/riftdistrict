import {
  getProductById as getDbProductById,
  getProductsByIds as getDbProductsByIds,
  isGuid,
} from "@/lib/db/products";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import type { IProduct } from "@/types";

export async function getProductById(id: string): Promise<IProduct | null> {
  if (isGuid(id)) {
    const product = await getDbProductById(id);
    if (product) return product;
  }

  return DEMO_PRODUCTS.find((product) => product._id === id) || null;
}

export async function getProductsByIds(ids: string[]): Promise<IProduct[]> {
  const productsById = new Map<string, IProduct>();
  const guidIds = ids.filter((id) => isGuid(id));
  const demoIds = ids.filter((id) => !isGuid(id));

  if (guidIds.length > 0) {
    const dbProducts = await getDbProductsByIds(guidIds);
    dbProducts.forEach((product) => {
      productsById.set(String(product._id), product);
    });
  }

  DEMO_PRODUCTS.filter((product) => demoIds.includes(product._id)).forEach(
    (product) => {
      productsById.set(product._id, product);
    }
  );

  return ids
    .map((id) => productsById.get(id))
    .filter((product): product is IProduct => Boolean(product));
}
