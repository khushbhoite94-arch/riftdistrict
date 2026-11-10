"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Gift, Share2, Star, Zap, Crown, Award,
  Clock, CheckCircle2, XCircle, ArrowDownCircle,
  ArrowUpCircle, Calendar, TrendingUp, Wallet
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LoyaltyTxnType = "earned" | "redeemed" | "reversed" | "expired" | "adjusted";
type LoyaltyTxnStatus = "pending" | "credited" | "redeemed" | "reversed" | "expired" | "cancelled";

interface LoyaltyTransaction {
  _id: string;
  orderId: string | null;
  orderNumber: string | null;
  type: LoyaltyTxnType;
  status: LoyaltyTxnStatus;
  points: number;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
  creditedAt: string | null;
}

interface LoyaltyDashboard {
  availablePoints: number;
  pendingPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  lifetimeExpired: number;
  transactions: LoyaltyTransaction[];
}

type LoyaltyTier = "Bronze" | "Silver" | "Gold";

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  Bronze: 1500,
  Silver: 5000,
  Gold: 5000,
};

const TIER_COLORS: Record<LoyaltyTier, string> = {
  Bronze: "from-amber-700 to-amber-500",
  Silver: "from-slate-400 to-slate-300",
  Gold: "from-yellow-500 to-yellow-300",
};

const TIER_PERKS: Record<LoyaltyTier, string[]> = {
  Bronze: ["Earn points on purchases", "Birthday discount 5%"],
  Silver: ["1.5x points multiplier", "Birthday discount 10%", "Early access to drops"],
  Gold: ["2x points multiplier", "Birthday discount 15%", "Free shipping always", "Exclusive Gold drops"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTier(points: number): LoyaltyTier {
  if (points >= 5000) return "Gold";
  if (points >= 1500) return "Silver";
  return "Bronze";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEstimatedCreditDate(orderCreatedAt: string): string {
  const created = new Date(orderCreatedAt);
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + 7);
  return formatDate(estimated.toISOString());
}

function TxnStatusIcon({ status }: { status: LoyaltyTxnStatus }) {
  switch (status) {
    case "pending":
      return <Clock size={16} className="text-amber-400" />;
    case "credited":
      return <CheckCircle2 size={16} className="text-green-400" />;
    case "redeemed":
      return <ArrowDownCircle size={16} className="text-blue-400" />;
    case "reversed":
      return <XCircle size={16} className="text-red-400" />;
    case "expired":
      return <XCircle size={16} className="text-gray-400" />;
    case "cancelled":
      return <XCircle size={16} className="text-gray-500" />;
    default:
      return <Clock size={16} className="text-rift-mist/50" />;
  }
}

function TxnTypeLabel({ type }: { type: LoyaltyTxnType }) {
  switch (type) {
    case "earned": return "Earned";
    case "redeemed": return "Redeemed";
    case "reversed": return "Reversed";
    case "expired": return "Expired";
    case "adjusted": return "Adjusted";
    default: return type;
  }
}

function StatusBadge({ status }: { status: LoyaltyTxnStatus }) {
  const colors: Record<LoyaltyTxnStatus, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    credited: "bg-green-500/20 text-green-300 border-green-500/30",
    redeemed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    reversed: "bg-red-500/20 text-red-300 border-red-500/30",
    expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    cancelled: "bg-gray-500/20 text-gray-500 border-gray-500/30",
  };

  return (
    <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [dashboard, setDashboard] = useState<LoyaltyDashboard | null>(null);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/loyalty");
    if (user?._id) {
      setReferralCode(`RIFT${(user._id as string).slice(-4).toUpperCase()}`);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch("/api/loyalty", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.dashboard) setDashboard(data.dashboard);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const copyReferral = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tier = dashboard ? getTier(dashboard.availablePoints) : "Bronze";
  const nextTier = tier === "Bronze" ? "Silver" : tier === "Silver" ? "Gold" : null;
  const progress = nextTier && dashboard
    ? Math.min((dashboard.availablePoints / TIER_THRESHOLDS[tier]) * 100, 100)
    : 100;

  if (loading || !user) return <div className="pt-32 min-h-screen" />;

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Rewards</p>
        <h1 className="text-4xl font-bold mb-12">Loyalty Dashboard</h1>

        {/* ─── Tier Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl p-8 sm:p-10 mb-8 overflow-hidden ${
            tier === "Gold" ? "bg-gradient-to-br from-yellow-500/20 to-yellow-300/20" :
            tier === "Silver" ? "bg-gradient-to-br from-slate-400/20 to-slate-300/20" :
            "bg-gradient-to-br from-amber-700/20 to-amber-500/20"
          }`}
        >
          <div className="absolute inset-0 bg-rift-base/40" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-white/70 text-sm uppercase tracking-widest mb-1">{user.name}</p>
                <h2 className="text-5xl font-bold text-white">{tier}</h2>
                <p className="text-white/70 text-sm mt-1">Member</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Available Points</p>
                <p className="text-5xl font-bold text-white">{(dashboard?.availablePoints ?? 0).toLocaleString()}</p>
                <p className="text-white/70 text-xs mt-1">= ₹{Math.floor((dashboard?.availablePoints ?? 0) / 100)} off</p>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between text-xs text-white/70 mb-2">
                  <span>{(dashboard?.availablePoints ?? 0).toLocaleString()} pts</span>
                  <span>{TIER_THRESHOLDS[tier].toLocaleString()} pts to {nextTier}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rift-orange to-rift-rust rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Balances Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Available", value: dashboard?.availablePoints ?? 0, icon: Wallet, color: "text-green-400" },
            { label: "Pending", value: dashboard?.pendingPoints ?? 0, icon: Clock, color: "text-amber-400" },
            { label: "Lifetime Earned", value: dashboard?.lifetimeEarned ?? 0, icon: TrendingUp, color: "text-rift-orange" },
            { label: "Lifetime Redeemed", value: dashboard?.lifetimeRedeemed ?? 0, icon: ArrowDownCircle, color: "text-blue-400" },
            { label: "Lifetime Expired", value: dashboard?.lifetimeExpired ?? 0, icon: XCircle, color: "text-gray-400" },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card--strong p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <item.icon size={16} className={item.color} />
                <p className="text-xs uppercase tracking-wider text-rift-mist/50">{item.label}</p>
              </div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Pending Points Detail ─── */}
        {dashboard && dashboard.pendingPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card--strong p-6 rounded-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-amber-400" size={20} />
              <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">Pending Points</h3>
            </div>
            <p className="text-xs text-rift-mist/60 mb-4">
              Points from recent orders are processing and will be available after the 7-day return window expires.
            </p>
            <div className="space-y-3">
              {dashboard.transactions
                .filter((t) => t.status === "pending")
                .map((txn) => (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between p-4 bg-rift-base/50 rounded-xl border border-amber-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          Order {txn.orderNumber}
                        </p>
                        <p className="text-xs text-rift-mist/50">
                          Placed on {formatDate(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">+{txn.points.toLocaleString()}</p>
                      <p className="text-[0.65rem] text-rift-mist/50">
                        Available on {getEstimatedCreditDate(txn.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* ─── Perks & How to Earn ─── */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="glass-card--strong p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="text-rift-orange" size={20} />
              <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">Your Perks</h3>
            </div>
            <ul className="space-y-3">
              {TIER_PERKS[tier].map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-rift-mist/80">
                  <span className="text-rift-orange">✓</span> {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card--strong p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Star className="text-rift-orange" size={20} />
              <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">How to Earn</h3>
            </div>
            <ul className="space-y-3">
              {[
                { action: "Every ₹1 spent", points: "+1 pt", icon: Zap },
                { action: "Write a review", points: "+50 pts", icon: Star },
                { action: "Refer a friend", points: "+200 pts", icon: Share2 },
              ].map((item) => (
                <li key={item.action} className="flex justify-between items-center text-sm">
                  <span className="text-rift-mist/70 flex items-center gap-2">
                    <item.icon size={14} />
                    {item.action}
                  </span>
                  <span className="text-rift-orange font-medium">{item.points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Referral ─── */}
        <div className="glass-card--strong p-8 mb-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="text-rift-orange" size={20} />
            <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">Refer & Earn</h3>
          </div>
          <p className="text-sm text-rift-mist/60 mb-4">
            Share your code. Your friend gets ₹200 off their first order. You get 200 points.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-rift-surface/50 border border-rift-mist/20 rounded-xl px-4 py-3 font-mono text-sm tracking-widest text-center flex items-center justify-center">
              {referralCode || "Generating..."}
            </div>
            <button
              onClick={copyReferral}
              className="px-6 py-3 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.15em] uppercase rounded-xl transition-all shadow-lg shadow-rift-orange/20"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* ─── Transaction History ─── */}
        <div className="glass-card--strong p-8 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-rift-orange" size={20} />
            <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">Transaction History</h3>
          </div>

          {fetching ? (
            <div className="text-center py-8 text-rift-mist/50 text-sm">Loading transactions...</div>
          ) : !dashboard || dashboard.transactions.length === 0 ? (
            <div className="text-center py-8 text-rift-mist/50 text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {dashboard.transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="flex items-center justify-between p-4 bg-rift-base/50 rounded-xl border border-rift-mist/10"
                >
                  <div className="flex items-center gap-3">
                    <TxnStatusIcon status={txn.status} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {txn.orderNumber ? `Order ${txn.orderNumber}` : txn.description}
                        </p>
                        <StatusBadge status={txn.status} />
                      </div>
                      <p className="text-xs text-rift-mist/50 mt-1">
                        <TxnTypeLabel type={txn.type} />
                        {" · "}
                        Created {formatDateTime(txn.createdAt)}
                        {txn.creditedAt && (
                          <> · Credited {formatDate(txn.creditedAt)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      txn.type === "earned" || txn.type === "adjusted"
                        ? "text-green-400"
                        : txn.type === "reversed" || txn.type === "redeemed"
                        ? "text-red-400"
                        : "text-rift-mist/70"
                    }`}>
                      {txn.type === "earned" || txn.type === "adjusted" ? "+" : "-"}
                      {Math.abs(txn.points).toLocaleString()}
                    </p>
                    {txn.status === "pending" && txn.createdAt && (
                      <p className="text-[0.65rem] text-amber-400/70">
                        Est. {getEstimatedCreditDate(txn.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── All Tiers ─── */}
        <div className="glass-card--strong p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="text-rift-orange" size={20} />
            <h3 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">All Tiers</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {(["Bronze", "Silver", "Gold"] as LoyaltyTier[]).map((t) => (
              <div
                key={t}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
                  tier === t ? "border-rift-orange bg-rift-orange/5" : "border-rift-mist/10"
                }`}
              >
                <p
                  className={`font-bold mb-2 text-lg bg-gradient-to-r ${TIER_COLORS[t]} bg-clip-text text-transparent`}
                >
                  {t}
                </p>
                <p className="text-xs text-rift-mist/50 mb-3">
                  {t === "Bronze" ? "0 pts" : t === "Silver" ? "1,500 pts" : "5,000 pts"}
                </p>
                <ul className="space-y-1">
                  {TIER_PERKS[t].slice(0, 2).map((perk) => (
                    <li key={perk} className="text-xs text-rift-mist/60">• {perk}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}