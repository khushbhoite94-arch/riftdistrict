"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Gift,
  Package,
  CreditCard,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "in-orbit": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/admin/orders?id=${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder((prev: any) => ({ ...prev, ...data.order }));
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-rift-surface rounded-xl animate-pulse" />
        <div className="glass-card--strong p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-rift-surface/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-rift-mist/50 mb-4">Order not found</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="flex items-center gap-2 text-sm text-rift-orange hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
      </div>
    );
  }

  const contact = order.userContact;
  const address = order.shippingAddress || {};
  const statusOptions = ["pending", "processing", "shipped", "in-orbit", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/orders")}
          className="p-2 border border-rift-mist/20 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-rift-mist/50">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">{contact?.name || "Guest"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">{contact?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">{address.phone || order.shippingPhone || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rift-mist/40 mt-0.5" />
                <span className="text-sm text-rift-mist/70">
                  {[address.street, address.city, address.state, address.zip, address.country].filter(Boolean).join(", ") || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {order.giftWrap && (
            <div className="glass-card--strong p-6 rounded-2xl">
              <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Gift Note</h2>
              <div className="flex items-start gap-3">
                <Gift className="w-4 h-4 text-rift-orange mt-0.5" />
                <div>
                  <p className="text-sm text-rift-mist/70">{order.giftMessage || "No message provided"}</p>
                  <p className="text-xs text-rift-orange mt-1">+₹50 gift wrap applied</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Order Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-rift-mist/50">
                      {[item.size, item.color, `Qty: ${item.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-rift-mist/60">Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-rift-mist/60">Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `₹${order.shipping?.toLocaleString()}`}</span>
              </div>
              {order.giftWrap && (
                <div className="flex justify-between text-rift-orange">
                  <span>Gift Note</span>
                  <span>+₹50</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-rift-mist/10">
                <span>Total</span>
                <span>₹{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Status</h2>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className={`w-full px-3 py-2 rounded-xl text-sm border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || "bg-white/5 text-rift-mist/60 border-white/5"}`}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="bg-rift-surface text-white">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rift-mist/40" />
                <span className="capitalize">{order.paymentMethod || "N/A"}</span>
              </div>
              {order.couponCode && (
                <p className="text-xs text-rift-mist/50">Coupon: {order.couponCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
