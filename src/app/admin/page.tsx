"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
  MoreVertical,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

type GenericObject = Record<string, unknown>;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "in-orbit": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  "in-orbit": "In Orbit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "in-orbit", "delivered", "cancelled"];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [analytics, setAnalytics] = useState<GenericObject | null>(null);
  const [orders, setOrders] = useState<GenericObject[]>([]);
  const [orderSearch, setOrderSearch] = useState("");

  useEffect(() => {
    if (!loading && user) {
      if ((user as any).role !== "admin") router.push("/");
    } else if (!loading && !user) {
      router.push("/login?redirect=/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if ((user as any)?.role === "admin") {
      fetch("/api/admin/analytics")
        .then((r) => r.json())
        .then(setAnalytics)
        .catch(() => {});
      fetch("/api/admin/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(() => {});
    }
  }, [user]);

  const stats = (analytics as { stats?: Record<string, unknown> })?.stats;

  const revenueData = useMemo(() => {
    const revenueByMonth = stats?.revenueByMonth as Record<string, number> | undefined;
    if (!revenueByMonth) return [];
    return Object.entries(revenueByMonth).map(([month, value]) => ({
      month,
      revenue: value,
      orders: Math.floor(value / 5000),
    }));
  }, [stats]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!response.ok) {
        throw new Error("Order status update failed");
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert("Failed to update order");
    }
  };

  if (loading || !user || (user as any).role !== "admin") {
    return <div className="pt-32 min-h-screen" />;
  }

  const kpiCards = [
    {
      label: "Revenue",
      value: stats?.totalRevenue ? formatPrice(stats.totalRevenue as number) : "₹0",
      change: "+12.5%",
      up: true,
      icon: DollarSign,
      color: "from-rift-orange to-rift-rust",
    },
    {
      label: "Orders",
      value: String(stats?.totalOrders ?? 0),
      change: "+8.2%",
      up: true,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Products",
      value: String(stats?.totalProducts ?? 0),
      change: "+3.1%",
      up: true,
      icon: Package,
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Customers",
      value: String(stats?.totalCustomers ?? 0),
      change: "+24.3%",
      up: true,
      icon: Users,
      color: "from-emerald-500 to-teal-400",
    },
    {
      label: "Subscribers",
      value: String(stats?.subscribers ?? 0),
      change: "+18.7%",
      up: true,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-400",
    },
  ];

  const filteredOrders = orders.filter((o) =>
    String(o.orderNumber || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-rift-mist/50 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card--strong p-5 rounded-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-[0.65rem] font-medium ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-xl font-semibold tracking-tight">{kpi.value}</p>
              <p className="text-[0.65rem] text-rift-mist/50 mt-0.5">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card--strong p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium">Revenue</h3>
              <p className="text-[0.65rem] text-rift-mist/50 mt-0.5">Monthly overview</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <MoreVertical className="w-4 h-4 text-rift-mist/50" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e95d2c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#e95d2c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8888a0", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8888a0", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(14,14,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  }}
                  labelStyle={{ color: "#b8b8c0", fontSize: 11 }}
                  formatter={(value: any) => [formatPrice(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e95d2c" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card--strong rounded-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-rift-mist/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Recent Orders</h3>
              <p className="text-[0.65rem] text-rift-mist/50 mt-0.5">Latest transactions</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rift-mist/40" />
              <input
                type="text"
                placeholder="Search..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-rift-surface/50 border border-rift-mist/10 rounded-lg text-xs text-white placeholder:text-rift-mist/30 focus:outline-none focus:border-rift-orange/30 w-full sm:w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-rift-mist/10">
                <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Order ID</th>
                <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Customer</th>
                <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Amount</th>
                <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Status</th>
                <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((order) => (
                <tr key={order._id as string} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-6">
                    <span className="font-mono text-[0.7rem] text-rift-mist/80">
                      {(order.orderNumber as string) || String(order._id).slice(-8)}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div>
                      <p className="text-xs font-medium">
                        {typeof order.userId === "object" && order.userId !== null
                          ? String((order.userId as { name?: string }).name || "Guest")
                          : "Guest"}
                      </p>
                      <p className="text-[0.6rem] text-rift-mist/40 mt-0.5">
                        {typeof order.userId === "object" && order.userId !== null
                          ? String((order.userId as { email?: string }).email || "")
                          : ""}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-xs font-medium">{formatPrice(order.total as number)}</span>
                  </td>
                  <td className="py-3 px-6">
                    <select
                      value={order.status as string}
                      onChange={(e) => updateOrderStatus(order._id as string, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-[0.6rem] tracking-wider uppercase border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[order.status as string] || "bg-white/5 text-rift-mist/60 border-white/5"}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-[0.7rem] text-rift-mist/50">
                      {new Date(order.createdAt as string).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-rift-mist/40">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}