"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Copy, CheckCircle, XCircle, Percent } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newType, setNewType] = useState("percentage");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => { setCoupons(d.coupons || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredCoupons = coupons.filter((c) =>
    (c.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const createCoupon = async () => {
    if (!newCode || !newDiscount) return;
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          discountType: newType,
          discountValue: parseFloat(newDiscount),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setCoupons((prev) => [...prev, d.coupon]);
        setNewCode("");
        setNewDiscount("");
        setShowForm(false);
      }
    } catch {
      alert("Failed to create coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{coupons.length} active coupons</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl font-medium shadow-lg shadow-rift-orange/20"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card--strong p-6 rounded-2xl"
        >
          <h3 className="text-sm font-medium mb-4">New Coupon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Code</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="input-field font-mono uppercase"
                placeholder="SUMMER25"
              />
            </div>
            <div>
              <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Discount</label>
              <input
                type="number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                className="input-field"
                placeholder="25"
              />
            </div>
            <div>
              <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={createCoupon} className="px-5 py-2 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl font-medium shadow-lg shadow-rift-orange/20">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-rift-mist/20 text-xs tracking-wider uppercase rounded-xl hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-rift-surface/60 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="glass-card--strong rounded-2xl py-16 text-center">
          <Percent className="w-8 h-8 text-rift-mist/20 mx-auto mb-3" />
          <p className="text-xs text-rift-mist/40 mb-4">
            {search ? "No coupons match your search" : "No coupons created yet"}
          </p>
          {!search && (
            <AnimatedButton onClick={() => setShowForm(true)} variant="outline">
              Create Your First Coupon
            </AnimatedButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon, i) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card--strong p-5 rounded-2xl group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rift-orange to-rift-rust opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rift-orange/10 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-rift-orange" />
                  </div>
                  <span className="font-mono text-sm font-medium">{coupon.code}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {copied === coupon.code ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-rift-mist/50" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                  </button>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-semibold">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </p>
                  <p className="text-[0.65rem] text-rift-mist/50 mt-0.5">
                    {coupon.discountType === "percentage" ? "Percentage off" : "Fixed discount"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6rem] text-rift-mist/40">{coupon.usedCount || 0} uses</p>
                  {coupon.expiresAt && (
                    <p className="text-[0.6rem] text-rift-mist/40">
                      Expires {new Date(coupon.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}