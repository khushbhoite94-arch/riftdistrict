import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { generateOrderNumber } from "@/lib/utils";
import { getProductById } from "@/lib/product-utils";
import { isGuid } from "@/lib/db/products";
import {
  getOrdersByUser,
  createOrder,
  ensureOrderGiftColumns,
  type CreateOrderInput,
  InsufficientStockError,
  InsufficientLoyaltyPointsError,
  CouponUnavailableError,
} from "@/lib/db/orders";
import { getUserContactById } from "@/lib/db/users";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { findActiveCouponByCode } from "@/lib/db/coupons";
import { query } from "@/lib/sql";
import { createPendingLoyaltyTransaction, getAvailableBalance, ensureLoyaltyTable } from "@/lib/db/loyalty";
import { getPointsForAmount } from "@/lib/utils";
import type { IOrder, IOrderItem, OrderStatus } from "@/types";
import type { LoyaltyTier } from "@/store/loyaltyStore";

const GIFT_WRAP_FEE = 50;

const ORDER_COLUMNS = `
  id AS [_id], order_number AS orderNumber, user_id AS userId,
  subtotal, discount, shipping, total, status,
  payment_method AS paymentMethod, coupon_code AS couponCode,
  shipping_street AS shippingStreet, shipping_city AS shippingCity,
  shipping_state AS shippingState, shipping_zip AS shippingZip,
  shipping_country AS shippingCountry, shipping_phone AS shippingPhone,
  gift_wrap AS giftWrap, gift_message AS giftMessage,
  created_at AS createdAt`;

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
  giftWrap: boolean;
  giftMessage: string | null;
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
    giftWrap: row.giftWrap,
    giftMessage: row.giftMessage ?? undefined,
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
    `SELECT order_id AS orderId, product_id AS productId, name, image,
            price, size, color, quantity FROM order_items
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

    await ensureOrderGiftColumns();

    if (orderId) {
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
    }

    const orders = await getOrdersByUser(user!.userId);
    return jsonResponse({ orders });
  } catch (err) {
    console.error("Order GET:", err);
    return errorResponse("Failed to fetch order", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { items, shippingAddress, paymentMethod, couponCode, giftWrap, giftMessage, pointsRedeemed } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !shippingAddress || !paymentMethod) {
      return errorResponse("Missing or invalid order details");
    }

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return errorResponse("Each item must have a valid product and quantity between 1 and 20");
      }
    }

    await ensureLoyaltyTable();

    let subtotal = 0;
    const orderItems: IOrderItem[] = [];
    const stockDecrements: { productId: string; quantity: number }[] = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) return errorResponse(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`);
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: String(product._id),
        name: product.name,
        image: product.images[0],
        price: product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      });

      if (isGuid(String(product._id))) {
        stockDecrements.push({
          productId: String(product._id),
          quantity: item.quantity,
        });
      }
    }

    let discount = 0;
    let couponIdToIncrement: string | null = null;
    let couponMaxUses: number | undefined;
    if (couponCode) {
      const coupon = await findActiveCouponByCode(couponCode);
      if (coupon && coupon.usedCount < coupon.maxUses) {
        if (subtotal >= coupon.minOrder) {
          const calculatedDiscount =
            coupon.discountType === "percentage"
              ? (subtotal * coupon.discountValue) / 100
              : coupon.discountValue;
          discount = Math.min(subtotal, Math.max(0, calculatedDiscount));
          couponIdToIncrement = coupon._id;
          couponMaxUses = coupon.maxUses;
        }
      }
    }

    const shipping = subtotal >= 999 ? 0 : 99;
    const giftFee = giftWrap ? GIFT_WRAP_FEE : 0;

    // --- Server-side points redemption validation (fix #1 & #2) ---
    let pointsDiscount = 0;
    let pointsToRedeem = 0;
    const requestedPoints =
      typeof pointsRedeemed === "number" && Number.isSafeInteger(pointsRedeemed) && pointsRedeemed > 0
        ? pointsRedeemed
        : 0;
    if (requestedPoints > 0) {
      const availableBalance = await getAvailableBalance(user!.userId);
      if (requestedPoints > availableBalance) {
        return errorResponse("Insufficient loyalty points", 409);
      }

      // 100 points = ₹1. Redeem only complete ₹1 units and never more than
      // the remaining payable amount; the unused points stay in the account.
      const remainingPayable = Math.max(0, subtotal - discount + shipping + giftFee);
      pointsToRedeem = Math.floor(
        Math.min(requestedPoints, Math.floor(remainingPayable) * 100) / 100
      ) * 100;
      pointsDiscount = pointsToRedeem / 100;
    }

    const totalDiscount = discount + pointsDiscount;
    const total = Math.max(0, subtotal - totalDiscount + shipping + giftFee);

    const payload: CreateOrderInput = {
      orderNumber: generateOrderNumber(),
      userId: user!.userId,
      items: orderItems,
      subtotal,
      discount: totalDiscount,
      shipping,
      total,
      status: "processing",
      paymentMethod,
      couponCode: couponCode ?? null,
      shippingAddress,
      stockDecrements,
      couponIdToIncrement,
      couponMaxUses,
      pointsToRedeem,
      giftWrap: !!giftWrap,
      giftMessage: giftWrap ? giftMessage ?? null : null,
    };

    const order = await createOrder(payload);

    // Earn points — tier-aware multiplier (fix #3 & #9)
    try {
      const balanceForTier = await getAvailableBalance(user!.userId);
      const tier: LoyaltyTier =
        balanceForTier >= 5000 ? "Gold" : balanceForTier >= 1500 ? "Silver" : "Bronze";
      const pointsEarned = getPointsForAmount(subtotal, tier);
      await createPendingLoyaltyTransaction({
        userId: user!.userId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        points: pointsEarned,
        description: `Points earned for order ${order.orderNumber}`,
      });
    } catch (loyaltyErr) {
      console.error("Loyalty pending transaction skipped:", loyaltyErr);
    }

    // Fire-and-forget order confirmation — never blocks or fails the order.
    try {
      const contact = await getUserContactById(user!.userId);
      if (contact) {
        sendOrderConfirmationEmail(
          { name: contact.name, email: contact.email },
          order.orderNumber
        );
      }
    } catch (mailErr) {
      console.error("Order confirmation email skipped:", mailErr);
    }

    return jsonResponse({ order }, 201);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return errorResponse("Some items are no longer available in the requested quantity. Refresh your cart.", 409);
    }
    if (err instanceof InsufficientLoyaltyPointsError) {
      return errorResponse("Your loyalty points balance changed. Refresh and try again.", 409);
    }
    if (err instanceof CouponUnavailableError) {
      return errorResponse("This coupon has reached its usage limit or is no longer active.", 409);
    }
    console.error("Orders POST:", err);
    return errorResponse("Failed to create order", 500);
  }
}