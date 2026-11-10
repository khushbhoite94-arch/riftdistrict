import { query } from "@/lib/sql";

export interface ActiveCoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
}

const COUPON_COLUMNS = `
  id AS [_id], code, discount_type AS discountType,
  discount_value AS discountValue, min_order AS minOrder,
  max_uses AS maxUses, used_count AS usedCount, active,
  expires_at AS expiresAt, created_at AS createdAt`;

export async function findActiveCouponByCode(
  code: string
): Promise<ActiveCoupon | null> {
  const res = await query<ActiveCoupon>(
    `SELECT TOP 1
       id AS [_id], code, discount_type AS discountType,
       discount_value AS discountValue, min_order AS minOrder,
       max_uses AS maxUses, used_count AS usedCount,
       expires_at AS expiresAt
     FROM coupons
     WHERE code = @code AND active = 1`,
    { code: code.toUpperCase() }
  );
  return res.recordset[0] ?? null;
}

export interface CouponRecord {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export async function listCoupons(): Promise<CouponRecord[]> {
  const res = await query<CouponRecord>(
    `SELECT ${COUPON_COLUMNS} FROM coupons ORDER BY created_at DESC`
  );
  return res.recordset;
}

export async function createCoupon(input: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder?: number;
  maxUses?: number;
  active?: boolean;
  expiresAt?: string | Date | null;
}): Promise<CouponRecord> {
  const res = await query<{ id: string }>(
    `INSERT INTO coupons
       (code, discount_type, discount_value, min_order, max_uses, active, expires_at)
     OUTPUT INSERTED.id AS id
     VALUES (@code, @discountType, @discountValue, @minOrder, @maxUses, @active, @expiresAt)`,
    {
      code: input.code.toUpperCase(),
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrder: input.minOrder ?? 0,
      maxUses: input.maxUses ?? 100,
      active: input.active ?? true,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    }
  );
  const created = await query<CouponRecord>(
    `SELECT ${COUPON_COLUMNS} FROM coupons WHERE id = @id`,
    { id: res.recordset[0].id }
  );
  return created.recordset[0];
}

export async function deleteCoupon(id: string): Promise<void> {
  await query(`DELETE FROM coupons WHERE id = @id`, { id });
}
