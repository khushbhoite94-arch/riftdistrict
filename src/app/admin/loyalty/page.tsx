"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, XCircle, ArrowDownCircle,
  ArrowUpCircle, Calendar, TrendingUp, Wallet, RefreshCw
} from "lucide-react";

interface LoyaltyTransaction {
  _id: string;
  userId: string;
  orderId: string | null;
  orderNumber: string | null;
  type: string;
  status: string;
  points: number;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
  creditedAt: string | null;
}

interface EligibleTransaction extends LoyaltyTransaction {
  orderCreatedAt: string;
}

export default function AdminLoyaltyPage() {
  const [pending, setPending] = useState<LoyaltyTransaction[]>([]);
  const [eligible, setEligible] = useState<EligibleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, eligibleRes] = await Promise.all([
        fetch("/api/admin/loyalty?type=pending"),
        fetch("/api/admin/loyalty?type=eligible"),
      ]);
      const pendingData = await pendingRes.json();
      const eligibleData = await eligibleRes.json();
      setPending(pendingData.pending || []);
      setEligible(eligibleData.eligible || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const processCredits = async () => {
    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/loyalty/process", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Credits processed successfully");
        fetchData();
      } else {
        setMessage(data.error || "Failed to process credits");
      }
    } catch {
      setMessage("Failed to process credits");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getEstimatedCreditDate = (orderCreatedAt: string) => {
    const created = new Date(orderCreatedAt);
    const estimated = new Date(created);
    estimated.setDate(estimated.getDate() + 7);
    return formatDate(estimated.toISOString());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Loyalty Management</h1>
        <div className="glass-card--strong rounded-2xl p-8 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-rift-surface/60 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loyalty Management</h1>
          <p className="text-sm text-rift-mist/50 mt-1">
            {pending.length} pending · {eligible.length} eligible for crediting
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={processCredits}
          disabled={processing || eligible.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={processing ? "animate-spin" : ""} />
          {processing ? "Processing..." : "Process Eligible Credits"}
        </motion.button>
      </div>

      {message && (
        <div className="glass-card--strong p-4 rounded-xl border border-rift-orange/30 text-sm text-rift-mist/80">
          {message}
        </div>
      )}

      {/* ─── Eligible for Credit ─── */}
      <div className="glass-card--strong rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-rift-mist/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-400" size={20} />
            <h2 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">
              Eligible for Credit
            </h2>
          </div>
          <p className="text-xs text-rift-mist/40 mt-2">
            Orders that have been delivered and passed the 7-day replacement window.
          </p>
        </div>

        {eligible.length === 0 ? (
          <div className="p-8 text-center text-rift-mist/40 text-sm">
            No eligible transactions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Order</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Points</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Delivered On</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Available On</th>
                </tr>
              </thead>
              <tbody>
                {eligible.map((txn) => (
                  <tr key={txn._id} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[0.7rem] text-rift-mist/80">
                        {txn.orderNumber || String(txn.orderId)?.slice(-8)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm font-medium text-green-400">
                        +{txn.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {formatDate(txn.orderCreatedAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {getEstimatedCreditDate(txn.orderCreatedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── All Pending ─── */}
      <div className="glass-card--strong rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-rift-mist/10">
          <div className="flex items-center gap-3">
            <Clock className="text-amber-400" size={20} />
            <h2 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">
              All Pending Transactions
            </h2>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-rift-mist/40 text-sm">
            No pending transactions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Order</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Points</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Status</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Created</th>
                  <th className="text-left py-3 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Available On</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((txn) => (
                  <tr key={txn._id} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[0.7rem] text-rift-mist/80">
                        {txn.orderNumber || String(txn.orderId)?.slice(-8)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm font-medium text-amber-400">
                        +{txn.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30">
                        pending
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {formatDate(txn.createdAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {getEstimatedCreditDate(txn.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
