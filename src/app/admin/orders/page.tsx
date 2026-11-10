"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Eye, Download, FileText, CreditCard, Truck, Gift } from "lucide-react";

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) =>
    String(o.orderNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error("Failed");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Total",
      "Gift Note",
      "Status",
      "Payment",
      "Date",
    ];
    const rows = filteredOrders.map((o) => {
      const name =
        typeof o.userId === "object" && o.userId !== null
          ? String((o.userId as any).name || "Guest")
          : "Guest";
      const email =
        typeof o.userId === "object" && o.userId !== null
          ? String((o.userId as any).email || "")
          : "";
      const giftNote = o.giftWrap
        ? o.giftMessage
          ? `"${String(o.giftMessage).replace(/"/g, '""')}"`
          : "No message"
        : "";
      return [
        o.orderNumber || String(o._id).slice(-8),
        `"${name.replace(/"/g, '""')}"`,
        email,
        o.total || 0,
        giftNote,
        o.status,
        o.paymentMethod || "",
        new Date(o.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{orders.length} total orders</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 glass-card text-xs tracking-wider uppercase rounded-xl"
        >
          <Download className="w-4 h-4" />
          Export
        </motion.button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="glass-card--strong rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-rift-surface/60 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-8 h-8 text-rift-mist/20 mx-auto mb-3" />
            <p className="text-xs text-rift-mist/40">No orders found</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Order ID</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Customer</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Total</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Status</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Payment</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Gift Note</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Date</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[0.7rem] text-rift-mist/80">{order.orderNumber || String(order._id).slice(-8)}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div>
                        <p className="text-xs font-medium">{typeof order.userId === "object" ? (order.userId as any).name || "Guest" : "Guest"}</p>
                        <p className="text-[0.6rem] text-rift-mist/40 mt-0.5">{typeof order.userId === "object" ? (order.userId as any).email || "" : ""}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">₹{(order.total || 0).toLocaleString()}</span>
                        {order.giftWrap && (
                          <span className="text-[0.6rem] text-rift-orange flex items-center gap-1 mt-0.5">
                            <Gift className="w-3 h-3" /> +₹50 gift note
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id as string, e.target.value)}
                        disabled={updatingId === order._id}
                        className={`px-2.5 py-1 rounded-lg text-[0.6rem] tracking-wider uppercase border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || "bg-white/5 text-rift-mist/60 border-white/5"}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs text-rift-mist/50 capitalize flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" />
                        {(order as any).paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {order.giftWrap && order.giftMessage ? (
                        <span className="text-xs text-rift-mist/70 max-w-[200px] truncate block" title={order.giftMessage}>
                          {order.giftMessage}
                        </span>
                      ) : order.giftWrap ? (
                        <span className="text-xs text-rift-mist/40 italic">No message</span>
                      ) : (
                        <span className="text-xs text-rift-mist/30">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-rift-mist/50" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredOrders.length > 0 && (
          <div className="md:hidden divide-y divide-rift-mist/5">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[0.7rem] text-rift-mist/80">
                      #{order.orderNumber || String(order._id).slice(-8)}
                    </span>
                    <p className="text-sm font-medium mt-1 truncate">
                      {typeof order.userId === "object" ? (order.userId as any).name || "Guest" : "Guest"}
                    </p>
                    <p className="text-[0.65rem] text-rift-mist/40 truncate">
                      {typeof order.userId === "object" ? (order.userId as any).email || "" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/orders/${order._id}`)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-rift-mist/50" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-medium">₹{(order.total || 0).toLocaleString()}</span>
                    {order.giftWrap && (
                      <span className="text-[0.6rem] text-rift-orange flex items-center gap-1 mt-0.5">
                        <Gift className="w-3 h-3" /> +₹50 gift note
                      </span>
                    )}
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id as string, e.target.value)}
                    disabled={updatingId === order._id}
                    className={`px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-wider uppercase border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || "bg-white/5 text-rift-mist/60 border-white/5"}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[0.7rem] text-rift-mist/50">
                  <span className="capitalize flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    {(order as any).paymentMethod || "N/A"}
                  </span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {order.giftWrap && order.giftMessage && (
                  <p className="text-xs text-rift-mist/70 italic border-t border-rift-mist/5 pt-2">
                    &ldquo;{order.giftMessage}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}