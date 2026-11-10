"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Calendar, Package, PackageCheck, User, Mail } from "lucide-react";
import type { IReplacementRequest } from "@/types/replacement";

export default function AdminReplacementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const replacementId = params.id as string;

  const [replacement, setReplacement] = useState<IReplacementRequest & { userName?: string; userEmail?: string; orderNumber?: string } | null>(null);
  const [fetching, setFetching] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [processingAction, setProcessingAction] = useState("");

  useEffect(() => {
    if (replacementId) {
      fetch(`/api/admin/replacements?id=${replacementId}`)
        .then((r) => r.json())
        .then((d) => {
          setReplacement(d.replacement);
          setAdminNotes(d.replacement?.adminNotes || "");
        })
        .catch(() => setReplacement(null))
        .finally(() => setFetching(false));
    }
  }, [replacementId]);

  const handleAction = async (action: string) => {
    if (!replacement) return;

    setProcessingAction(action);
    try {
      const res = await fetch("/api/admin/replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          replacementId: replacement._id,
          adminNotes,
          deliveryDate: deliveryDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.replacement) {
        setReplacement(data.replacement);
      }
    } catch {
      console.error("Action failed");
    } finally {
      setProcessingAction("");
    }
  };

  if (fetching) {
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

  if (!replacement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-rift-mist/50 mb-4">Request not found</p>
        <button
          onClick={() => router.push("/admin/replacements")}
          className="flex items-center gap-2 text-sm text-rift-orange hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </button>
      </div>
    );
  }

  const images = Array.isArray(replacement.images) ? replacement.images : JSON.parse(replacement.images || "[]");
  const isRejected = replacement.status === "rejected";
  const isDelivered = replacement.status === "delivered";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 border border-rift-mist/20 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Details</h1>
          <p className="text-sm text-rift-mist/50">#{replacement.requestId}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Customer Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">{replacement.userName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">{replacement.userEmail}</span>
              </div>
            </div>
          </div>

          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Order Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm font-mono">{replacement.orderNumber || replacement.orderId}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-rift-mist/40" />
                <span className="text-sm">Requested: {new Date(replacement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Images</h2>
            <div className="grid grid-cols-3 gap-3">
              {images.map((src: string, i: number) => (
                <div key={i} className="aspect-square bg-rift-surface rounded-xl overflow-hidden">
                  <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {replacement.description && (
            <div className="glass-card--strong p-6 rounded-2xl">
              <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Description</h2>
              <p className="text-sm">{replacement.description}</p>
            </div>
          )}

          {replacement.requestedSize && (
            <div className="glass-card--strong p-6 rounded-2xl">
              <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Size Request</h2>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-rift-mist/50">Current Size</span>
                  <p className="text-sm font-medium">{replacement.currentSize}</p>
                </div>
                <div>
                  <span className="text-xs text-rift-mist/50">Requested Size</span>
                  <p className="text-sm font-medium">{replacement.requestedSize}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card--strong p-6 rounded-2xl">
            <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Status</h2>
            <span className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider border inline-block ${
              isRejected
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : isDelivered
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {replacement.status.replace(/_/g, " ")}
            </span>
          </div>

          {!isRejected && !isDelivered && (
            <>
              <div className="glass-card--strong p-6 rounded-2xl">
                <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Admin Notes</h2>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="input-field h-24 resize-none mb-3"
                />
                <button
                  onClick={() => handleAction("addNotes")}
                  disabled={processingAction === "addNotes" || !adminNotes}
                  className="text-xs px-3 py-1.5 border border-rift-mist/20 rounded-lg hover:bg-white/5 transition disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>

              <div className="glass-card--strong p-6 rounded-2xl">
                <h2 className="text-xs tracking-wider uppercase text-rift-mist/50 mb-4">Actions</h2>
                <div className="space-y-2">
                  {replacement.status === "pending" && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction("approve")}
                        disabled={processingAction === "approve"}
                        className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-500/30 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Request
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction("reject")}
                        disabled={processingAction === "reject"}
                        className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-xs uppercase tracking-wider hover:bg-red-500/30 transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Request
                      </motion.button>
                    </>
                  )}

                  {replacement.status === "approved" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction("schedulePickup")}
                      disabled={processingAction === "schedulePickup"}
                      className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl text-xs uppercase tracking-wider hover:bg-blue-500/30 transition disabled:opacity-50"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Pickup
                    </motion.button>
                  )}

                  {replacement.status === "pickup_scheduled" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction("markPickedUp")}
                      disabled={processingAction === "markPickedUp"}
                      className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-500/30 transition disabled:opacity-50"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Mark Picked Up
                    </motion.button>
                  )}

                  {replacement.status === "picked_up" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction("markOutForDelivery")}
                      disabled={processingAction === "markOutForDelivery"}
                      className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl text-xs uppercase tracking-wider hover:bg-purple-500/30 transition disabled:opacity-50"
                    >
                      Out For Delivery
                    </motion.button>
                  )}

                  {replacement.status === "out_for_delivery" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction("markDelivered")}
                      disabled={processingAction === "markDelivered"}
                      className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-500/30 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Delivered
                    </motion.button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}