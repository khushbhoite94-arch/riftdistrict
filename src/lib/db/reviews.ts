import { query } from "@/lib/sql";
import type { IReview } from "@/types";

const REVIEW_COLUMNS = `
  id AS [_id], product_id AS productId, user_id AS userId,
  user_name AS userName, rating, comment, created_at AS createdAt`;

export async function getReviewsByProduct(
  productId: string
): Promise<IReview[]> {
  const res = await query<IReview>(
    `SELECT ${REVIEW_COLUMNS} FROM reviews
     WHERE product_id = @productId
     ORDER BY created_at DESC`,
    { productId }
  );
  return res.recordset;
}

export interface CreateReviewInput {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

export async function createReview(
  input: CreateReviewInput
): Promise<IReview> {
  const res = await query<IReview>(
    `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
     OUTPUT INSERTED.id AS [_id], INSERTED.product_id AS productId,
            INSERTED.user_id AS userId, INSERTED.user_name AS userName,
            INSERTED.rating, INSERTED.comment, INSERTED.created_at AS createdAt
     VALUES (@productId, @userId, @userName, @rating, @comment)`,
    { ...input }
  );
  return res.recordset[0];
}

export async function recomputeProductRating(
  productId: string
): Promise<void> {
  await query(
    `UPDATE products
     SET rating = ROUND(COALESCE(agg.avgRating, 0), 1),
         review_count = COALESCE(agg.cnt, 0)
     FROM products p
     OUTER APPLY (
       SELECT AVG(CAST(rating AS DECIMAL(4,2))) AS avgRating, COUNT(*) AS cnt
       FROM reviews WHERE product_id = @productId
     ) agg
     WHERE p.id = @productId`,
    { productId }
  );
}
