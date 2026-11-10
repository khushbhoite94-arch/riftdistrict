import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { query } from "@/lib/sql";
import type { IOrder, IOrderItem, OrderStatus } from "@/types";

const ORDER_COLUMNS = `
  id AS [_id], order_number AS orderNumber, user_id AS userId,
  subtotal, discount, shipping, total, status,
  payment_method AS paymentMethod, coupon_code AS couponCode,
  shipping_street AS shippingStreet, shipping_city AS shippingCity,
  shipping_state AS shippingState, shipping_zip AS shippingZip,
  shipping_country AS shippingCountry, shipping_phone AS shippingPhone,
  created_at AS createdAt`;

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
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  shippingPhone: string | null;
  createdAt: string;
}

interface ItemRow extends IOrderItem {
  orderId: string;
}

function mapOrder(row: OrderRow, items: IOrderItem[]): IOrder & { orderNumber: string } {
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

async function loadItemsFor(orderIds: string[]): Promise<Map<string, IOrderItem[]>> {
  const byOrder = new Map<string, IOrderItem[]>();
  if (orderIds.length === 0) return byOrder;

  const params: Record<string, unknown> = {};
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
    list.push({
      productId: String(row.productId ?? ""),
      name: row.name,
      image: row.image,
      price: row.price,
      size: row.size,
      color: row.color,
      quantity: row.quantity,
    });
    byOrder.set(row.orderId, list);
  }
  return byOrder;
}

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    if (!orderId) return errorResponse("Order ID required");

    const res = await query<OrderRow>(
      `SELECT ${ORDER_COLUMNS} FROM orders
       WHERE id = @orderId AND user_id = @userId`,
      { orderId, userId: user!.userId }
    );

    const row = res.recordset[0];
    if (!row) return errorResponse("Order not found", 404);

    const items = await loadItemsFor([row._id]);
    const order = mapOrder(row, items.get(row._id) ?? []);

    return jsonResponse({ order });
  } catch (err) {
    console.error("Order GET:", err);
    return errorResponse("Failed to fetch order", 500);
  }
}