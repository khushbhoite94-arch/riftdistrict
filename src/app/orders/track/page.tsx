"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { Search, Package, Clock, Truck, MapPin, CheckCircle2 } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package, desc: "We've received your order" },
  { key: "processing", label: "Processing", icon: Clock, desc: "Your order is being prepared" },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on the way" },
  { key: "in-orbit", label: "Out for Delivery", icon: MapPin, desc: "Almost there!" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, desc: "Enjoy your Rift District piece" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(orderNumber);
  const [error, setError] = useState("");

  const fetchOrder = async (num: string) => {
    if (!num) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/track?order=${num}`, { credentials: "include" });
      if (!res.ok) { setError("Order not found. Please check your order number."); setOrder(null); }
      else { const data = await res.json(); setOrder(data.order); }
    } catch { setError("Failed to fetch order."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (orderNumber) fetchOrder(orderNumber); }, [orderNumber]);

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Delivery</p>
        <h1 className="text-4xl font-bold mb-12">Track Your Order</h1>

        <div className="flex gap-3 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rift-mist/40" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter order number"
              className="input-field w-full pl-12"
              onKeyDown={(e) => e.key === "Enter" && fetchOrder(input)}
            />
          </div>
          <button
            onClick={() => fetchOrder(input)}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.15em] uppercase rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
          >
            {loading ? "..." : "Track"}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card--strong p-8 mb-8 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-mono text-xl font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-rift-mist/50 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-rift-orange/20 text-rift-orange text-xs uppercase tracking-wider">
                  {order.status}
                </span>
              </div>
              <div className="border-t border-rift-mist/10 pt-4 space-y-2">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-rift-mist/70">{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card--strong p-8 rounded-2xl">
              <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-8">Delivery Status</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rift-mist/10" />
                <motion.div
                  className="absolute left-4 top-0 w-0.5 bg-rift-orange"
                  initial={{ height: "0%" }}
                  animate={{ height: `${(Math.min(currentStepIndex + 1, STATUS_STEPS.length) / STATUS_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <div className="space-y-8">
                  {STATUS_STEPS.filter(s => s.key !== "in-orbit" || order.status === "in-orbit" || currentStepIndex > STATUS_STEPS.findIndex(x => x.key === "in-orbit")).map((step, i) => {
                    const stepIndex = STATUS_STEPS.findIndex(s => s.key === step.key);
                    const isDone = stepIndex <= currentStepIndex;
                    const isCurrent = stepIndex === currentStepIndex;
                    return (
                      <div key={step.key} className="flex gap-6 relative">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            isDone ? "bg-rift-orange text-white" : "bg-rift-surface border border-rift-mist/20 text-rift-mist"
                          } ${isCurrent ? "ring-2 ring-rift-orange ring-offset-2 ring-offset-rift-base" : ""}`}
                        >
                          <step.icon size={16} />
                        </motion.div>
                        <div className="flex-1 pt-1">
                          <p className={`font-medium text-sm ${isDone ? "text-white" : "text-rift-mist/40"}`}>{step.label}</p>
                          <p className={`text-xs mt-0.5 ${isDone ? "text-rift-mist/60" : "text-rift-mist/30"}`}>{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="glass-card--strong p-6 mt-6 rounded-2xl">
                <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-3">Delivering To</h3>
                <p className="text-sm text-rift-mist/70">{order.shippingAddress.street}</p>
                <p className="text-sm text-rift-mist/70">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p className="text-sm text-rift-mist/70">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="text-sm text-rift-mist/70 mt-1">📞 {order.shippingAddress.phone}</p>}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return <Suspense fallback={<div className="pt-32 min-h-screen" />}><TrackContent /></Suspense>;
}