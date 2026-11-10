"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import type { IReplacementRequest } from "@/types/replacement";
import { CheckCircle2, XCircle, Package, Truck, Search, Clock } from "lucide-react";

const MILESTONES = [
  { key: "approved", label: "Replacement Accepted", icon: CheckCircle2 },
  { key: "pickup_scheduled", label: "Pickup Scheduled", icon: Package },
  { key: "picked_up", label: "Quality Check", icon: Search },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  approved: 1,
  pickup_scheduled: 2,
  picked_up: 3,
  out_for_delivery: 4,
  delivered: 5,
  rejected: -1,
};

export default function ReplacementTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;
  const { user, loading } = useAuthStore();

  const [request, setRequest] = useState<IReplacementRequest | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (requestId) {
      fetch(`/api/replacements?requestId=${requestId}`)
        .then((r) => r.json())
        .then((data) => setRequest(data.replacement))
        .catch(() => setRequest(null))
        .finally(() => setFetching(false));
    }
  }, [requestId]);

  if (loading || fetching) {
    return <div className="pt-32 min-h-screen" />;
  }

  if (!request) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-rift-mist/50 text-lg">Request not found</p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[request.status] ?? 0;
  const isRejected = request.status === "rejected";

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card--strong p-10 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50">Request ID</p>
              <p className="font-mono text-xl font-bold">{request.requestId}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider border ${
              isRejected
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : request.status === "delivered"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {request.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="mb-8">
            <p className="text-sm text-rift-mist/50">Order ID: {(request as any).orderNumber || request.orderId}</p>
            <p className="text-sm text-rift-mist/50 mt-1">
              Created: {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>

          {isRejected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="text-red-400" size={32} />
              </div>
              <p className="text-red-400 font-medium text-lg">Your request has been rejected</p>
              {request.adminNotes && (
                <p className="text-sm text-rift-mist/60 mt-2">{request.adminNotes}</p>
              )}
            </motion.div>
          ) : (
            <div>
              <div className="relative mb-12">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rift-mist/10" />
                <motion.div
                  className="absolute left-4 top-0 w-0.5 bg-rift-orange"
                  initial={{ height: "0%" }}
                  animate={{ height: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <div className="space-y-8">
                  {MILESTONES.map((milestone, i) => {
                    const isDone = i < currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <motion.div
                        key={milestone.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-6 relative"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isDone ? "bg-rift-orange text-white" : "bg-rift-surface border border-rift-mist/20 text-rift-mist"
                        } ${isCurrent ? "ring-2 ring-rift-orange ring-offset-2 ring-offset-rift-base" : ""}`}>
                          <milestone.icon size={16} />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`font-medium text-sm ${isDone ? "text-white" : "text-rift-mist/40"}`}>{milestone.label}</p>
                          {isCurrent && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={12} className="text-rift-orange" />
                              <p className="text-xs text-rift-orange">In Progress</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {request.adminNotes && (
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs text-rift-mist/50 uppercase tracking-wider mb-2">Admin Notes</p>
                  <p className="text-sm">{request.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}