import { query, withTransaction, sql, getPool, type SqlParams } from "@/lib/sql";
import type { IOrder, IOrderItem, OrderStatus } from "@/types";

export interface OrderRecord extends IOrder {
  orderNumber: string;
}

export class InsufficientStockError extends Error {
  constructor() {
    super("One or more products no longer have enough stock.");
    this.name = "InsufficientStockError";
  }
}

export class InsufficientLoyaltyPointsError extends Error {
  constructor() {
    super("Your loyalty points balance changed. Please refresh and try again.");
    this.name = "InsufficientLoyaltyPointsError";
  }
}

export class CouponUnavailableError extends Error {
  constructor() {
    super("This coupon is no longer available.");
    this.name = "CouponUnavailableError";
  }
}

const ORDER_COLUMNS = `
  id AS [_id], order_number AS orderNumber, user_id AS userId,
  subtotal, discount, shipping, total, status,
  payment_method AS paymentMethod, coupon_code AS couponCode,
  tracking_number AS trackingNumber,
  shipping_street AS shippingStreet, shipping_city AS shippingCity,
  shipping_state AS shippingState, shipping_zip AS shippingZip,
  shipping_country AS shippingCountry, shipping_phone AS shippingPhone,
  gift_wrap AS giftWrap, gift_message AS giftMessage,
  created_at AS createdAt`;

/** Idempotently add the tracking_number column used by the shipped email. */
export async function ensureOrderTrackingColumn(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(
    `IF COL_LENGTH('orders','tracking_number') IS NULL ALTER TABLE orders ADD tracking_number NVARCHAR(100) NULL;`
  );
}

/** Idempotently add gift_wrap and gift_message columns. */
export async function ensureOrderGiftColumns(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(
    `IF COL_LENGTH('orders','gift_wrap') IS NULL ALTER TABLE orders ADD gift_wrap BIT NOT NULL DEFAULT 0;
     IF COL_LENGTH('orders','gift_message') IS NULL ALTER TABLE orders ADD gift_message NVARCHAR(500) NULL;`
  );
}

const ITEM_COLUMNS = `
  order_id AS orderId, product_id AS productId, name, image,
  price, size, color, quantity`;

interface OrderRow {
  _id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  couponCode: string | null;
  trackingNumber: string | null;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  shippingPhone: string | null;
  giftWrap: boolean;
  giftMessage: string | null;
  createdAt: string;
}

interface ItemRow extends IOrderItem {
  orderId: string;
}

function mapOrder(row: OrderRow, items: IOrderItem[]): OrderRecord {
  return {
    _id: row._id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    items,
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    paymentMethod: row.paymentMethod,
    couponCode: row.couponCode ?? undefined,
    trackingNumber: row.trackingNumber ?? null,
    giftWrap: row.giftWrap,
    giftMessage: row.giftMessage ?? undefined,
    shippingAddress: {
      street: row.shippingStreet,
      city: row.shippingCity,
      state: row.shippingState,
      zip: row.shippingZip,
      country: row.shippingCountry,
      ...(row.shippingPhone ? { phone: row.shippingPhone } : {}),
    },
    createdAt: row.createdAt,
  };
}

function mapItemRow(row: ItemRow): IOrderItem {
  return {
    productId: String(row.productId ?? ""),
    name: row.name,
    image: row.image,
    price: row.price,
    size: row.size,
    color: row.color,
    quantity: row.quantity,
  };
}

async function loadItemsFor(orderIds: string[]): Promise<Map<string, IOrderItem[]>> {
  const byOrder = new Map<string, IOrderItem[]>();
  if (orderIds.length === 0) return byOrder;

  const params: SqlParams = {};
  const placeholders = orderIds.map((id, i) => {
    params[`o${i}`] = id;
    return `@o${i}`;
  });
  const res = await query<ItemRow>(
    `SELECT ${ITEM_COLUMNS} FROM order_items
     WHERE order_id IN (${placeholders.join(", ")})`,
    params
  );
  for (const row of res.recordset) {
    const list = byOrder.get(row.orderId) ?? [];
    list.push(mapItemRow(row));
    byOrder.set(row.orderId, list);
  }
  return byOrder;
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  await ensureOrderTrackingColumn();
  const res = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId }
  );
  const items = await loadItemsFor(res.recordset.map((r) => r._id));
  return res.recordset.map((row) => mapOrder(row, items.get(row._id) ?? []));
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderRecord | null> {
  await ensureOrderTrackingColumn();
  const res = await query<OrderRow>(
    `SELECT TOP 1 ${ORDER_COLUMNS} FROM orders WHERE order_number = @orderNumber`,
    { orderNumber }
  );
  const row = res.recordset[0];
  if (!row) return null;
  const items = await loadItemsFor([row._id]);
  return mapOrder(row, items.get(row._id) ?? []);
}

export async function getOrderById(
  orderId: string
): Promise<OrderRecord | null> {
  await ensureOrderTrackingColumn();
  const res = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = @orderId`,
    { orderId }
  );
  const row = res.recordset[0];
  if (!row) return null;
  const items = await loadItemsFor([row._id]);
  return mapOrder(row, items.get(row._id) ?? []);
}

// --- Admin ----------------------------------------------------------

export interface AdminOrder extends Omit<OrderRecord, "userId"> {
  userId: { _id: string; name: string; email: string } | null;
}

interface AdminOrderRow extends OrderRow {
  userName: string | null;
  userEmail: string | null;
}

function mapAdminOrder(row: AdminOrderRow, items: IOrderItem[]): AdminOrder {
  const base = mapOrder(row, items);
  return {
    ...base,
    userId: row.userName
      ? { _id: row.userId, name: row.userName, email: row.userEmail ?? "" }
      : null,
  };
}

const ADMIN_ORDER_COLUMNS = `
  o.id AS [_id], o.order_number AS orderNumber, o.user_id AS userId,
  o.subtotal, o.discount, o.shipping, o.total, o.status,
  o.payment_method AS paymentMethod, o.coupon_code AS couponCode,
  o.tracking_number AS trackingNumber,
  o.shipping_street AS shippingStreet, o.shipping_city AS shippingCity,
  o.shipping_state AS shippingState, o.shipping_zip AS shippingZip,
  o.shipping_country AS shippingCountry, o.shipping_phone AS shippingPhone,
  o.gift_wrap AS giftWrap, o.gift_message AS giftMessage,
  o.created_at AS createdAt`;

async function fetchAdminOrders(limit?: number): Promise<AdminOrder[]> {
  await ensureOrderTrackingColumn();
  await ensureOrderGiftColumns();
  const top = limit ? `TOP (${Number(limit)}) ` : "";
  const res = await query<AdminOrderRow>(
    `SELECT ${top}${ADMIN_ORDER_COLUMNS},
            u.name AS userName, u.email AS userEmail
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`,
    {}
  );
  const items = await loadItemsFor(res.recordset.map((r) => r._id));
  return res.recordset.map((row) => mapAdminOrder(row, items.get(row._id) ?? []));
}

export async function listAllOrders(): Promise<AdminOrder[]> {
  return fetchAdminOrders();
}

export async function getRecentOrders(limit = 5): Promise<AdminOrder[]> {
  return fetchAdminOrders(limit);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string | null
): Promise<OrderRecord | null> {
  await ensureOrderTrackingColumn();
  // No OUTPUT clause: the orders AFTER UPDATE trigger forbids OUTPUT-without-INTO.
  const setTracking = trackingNumber !== undefined ? ", tracking_number = @trackingNumber" : "";
  const res = await query(
    `UPDATE orders SET status = @status${setTracking} WHERE id = @orderId`,
    trackingNumber !== undefined
      ? { orderId, status, trackingNumber: trackingNumber ?? null }
      : { orderId, status }
  );
  if ((res.rowsAffected[0] ?? 0) === 0) return null;
  const found = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = @orderId`,
    { orderId }
  );
  const items = await loadItemsFor([orderId]);
  return mapOrder(found.recordset[0], items.get(orderId) ?? []);
}

export interface CreateOrderInput {
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  couponCode?: string | null;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  stockDecrements: { productId: string; quantity: number }[];
  couponIdToIncrement?: string | null;
  couponMaxUses?: number;
  pointsToRedeem?: number;
  giftWrap?: boolean;
  giftMessage?: string | null;
}

function bind(request: sql.Request, params: SqlParams): sql.Request {
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<OrderRecord> {
  return withTransaction(async (tx) => {
    if (input.pointsToRedeem && input.pointsToRedeem > 0) {
      // Serialize redemptions for this account so concurrent checkouts cannot
      // spend the same points balance.
      await bind(new sql.Request(tx), { userId: input.userId }).query(
        `SELECT id FROM users WITH (UPDLOCK, HOLDLOCK) WHERE id = @userId`
      );
      const balance = await bind(new sql.Request(tx), { userId: input.userId }).query<{ balance: number }>(
        `SELECT ISNULL(SUM(
           CASE
             WHEN status = 'credited' AND type IN ('earned','adjusted') THEN points
             WHEN type = 'redeemed' THEN -ABS(points)
             WHEN type = 'reversed' THEN points
             ELSE 0
           END
         ), 0) AS balance
         FROM loyalty_transactions
         WHERE user_id = @userId AND status IN ('credited','redeemed','reversed')`
      );
      if ((balance.recordset[0]?.balance ?? 0) < input.pointsToRedeem) {
        throw new InsufficientLoyaltyPointsError();
      }
    }

    for (const dec of input.stockDecrements) {
      const stockUpdate = await bind(new sql.Request(tx), {
        id: dec.productId,
        q: dec.quantity,
      }).query(
        `UPDATE products SET stock = stock - @q
         WHERE id = @id AND stock >= @q`
      );
      if ((stockUpdate.rowsAffected[0] ?? 0) !== 1) {
        throw new InsufficientStockError();
      }
    }

    if (input.couponIdToIncrement) {
      const couponUpdate = await bind(new sql.Request(tx), {
        id: input.couponIdToIncrement,
        maxUses: input.couponMaxUses ?? 0,
      }).query(
        `UPDATE coupons
         SET used_count = used_count + 1
         WHERE id = @id AND used_count < @maxUses AND active = 1
           AND (expires_at IS NULL OR expires_at > SYSUTCDATETIME())`
      );
      if ((couponUpdate.rowsAffected[0] ?? 0) !== 1) {
        throw new CouponUnavailableError();
      }
    }

    const inserted = await bind(new sql.Request(tx), {
      orderNumber: input.orderNumber,
      userId: input.userId,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      status: input.status,
      paymentMethod: input.paymentMethod,
      couponCode: input.couponCode ?? null,
      shippingStreet: input.shippingAddress.street,
      shippingCity: input.shippingAddress.city,
      shippingState: input.shippingAddress.state,
      shippingZip: input.shippingAddress.zip,
      shippingCountry: input.shippingAddress.country,
      shippingPhone: input.shippingAddress.phone ?? null,
      giftWrap: input.giftWrap ? 1 : 0,
      giftMessage: input.giftMessage ?? null,
    }).query<{ _id: string; createdAt: string }>(
      `INSERT INTO orders
         (order_number, user_id, subtotal, discount, shipping, total, status,
          payment_method, coupon_code, shipping_street, shipping_city,
          shipping_state, shipping_zip, shipping_country, shipping_phone,
          gift_wrap, gift_message)
       OUTPUT INSERTED.id AS [_id], INSERTED.created_at AS createdAt
       VALUES
         (@orderNumber, @userId, @subtotal, @discount, @shipping, @total, @status,
          @paymentMethod, @couponCode, @shippingStreet, @shippingCity,
          @shippingState, @shippingZip, @shippingCountry, @shippingPhone,
          @giftWrap, @giftMessage)`
    );

    const orderId = inserted.recordset[0]._id;
    const createdAt = inserted.recordset[0].createdAt;

    if (input.pointsToRedeem && input.pointsToRedeem > 0) {
      await bind(new sql.Request(tx), {
        userId: input.userId,
        orderId,
        orderNumber: input.orderNumber,
        points: input.pointsToRedeem,
        description: `Points redeemed for order ${input.orderNumber}`,
      }).query(
        `INSERT INTO loyalty_transactions
           (user_id, order_id, order_number, type, status, points, description)
         VALUES
           (@userId, @orderId, @orderNumber, 'redeemed', 'redeemed', @points, @description)`
      );
    }

    for (const item of input.items) {
      await bind(new sql.Request(tx), {
        orderId,
        productId: item.productId || null,
        name: item.name,
        image: item.image ?? null,
        price: item.price,
        size: item.size ?? null,
        color: item.color ?? null,
        quantity: item.quantity,
      }).query(
        `INSERT INTO order_items
           (order_id, product_id, name, image, price, size, color, quantity)
         VALUES
           (@orderId, @productId, @name, @image, @price, @size, @color, @quantity)`
      );
    }

    return {
      _id: orderId,
      orderNumber: input.orderNumber,
      userId: input.userId,
      items: input.items,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      status: input.status,
      paymentMethod: input.paymentMethod,
      couponCode: input.couponCode ?? undefined,
      giftWrap: input.giftWrap ?? false,
      giftMessage: input.giftMessage ?? undefined,
      shippingAddress: input.shippingAddress,
      createdAt,
    };
  });
}
