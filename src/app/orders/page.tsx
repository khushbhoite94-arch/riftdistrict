"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/orders", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          setOrders(data.orders || []);
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [user]);

  if (loading || loadingOrders) {
    return <div className="pt-32 min-h-screen" />;
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Account</p>
        <h1 className="text-4xl font-bold mb-12">My Orders</h1>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full glass-card--strong flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-rift-mist/50" />
            </div>
            <p className="text-rift-mist/50 mb-6">No orders yet</p>
            <Link href="/shop" className="text-rift-orange hover:underline">Start Shopping</Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card--strong p-6 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-lg font-bold">{(order as any).orderNumber || order._id}</p>
                    <p className="text-sm text-rift-mist/50 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full glass-card">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rift-mist/60">{order.items.length} items</span>
                  <span className="font-medium">₹{order.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}