import { query } from "@/lib/sql";

export async function getWishlistProductIds(
  userId: string
): Promise<string[]> {
  const res = await query<{ productId: string }>(
    `SELECT product_id AS productId FROM wishlist_items
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId }
  );
  return res.recordset.map((r) => r.productId);
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<void> {
  await query(
    `INSERT INTO wishlist_items (user_id, product_id)
     SELECT @userId, @productId
     WHERE NOT EXISTS (
       SELECT 1 FROM wishlist_items
       WHERE user_id = @userId AND product_id = @productId
     )`,
    { userId, productId }
  );
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  await query(
    `DELETE FROM wishlist_items
     WHERE user_id = @userId AND product_id = @productId`,
    { userId, productId }
  );
}
