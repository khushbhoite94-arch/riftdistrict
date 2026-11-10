"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle, XCircle, Calendar, Package, PackageCheck } from "lucide-react";
import Link from "next/link";
import type { IReplacementRequest } from "@/types/replacement";

export default function AdminReplacementsPage() {
  const [replacements, setReplacements] = useState<IReplacementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/replacements")
      .then((r) => r.json())
      .then((d) => {
        setReplacements(d.replacements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReplacements = replacements.filter((r) =>
    String(r.requestId || "").toLowerCase().includes(search.toLowerCase()) ||
    String(r.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
    String((r as any).userName || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    pickup_scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    picked_up: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    out_for_delivery: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Requests</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{replacements.length} total requests</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
        <input
          type="text"
          placeholder="Search requests..."
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
        ) : filteredReplacements.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-rift-mist/20 mx-auto mb-3" />
            <p className="text-xs text-rift-mist/40">No support requests found</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Request ID</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Order ID</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Customer</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Type</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Status</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Date</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReplacements.map((r) => (
                  <tr key={r._id} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[0.7rem] text-rift-mist/80">{r.requestId}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[0.7rem] text-rift-mist/80">{(r as any).orderNumber || String(r.orderId).slice(-8)}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div>
                        <p className="text-xs font-medium">{(r as any).userName || "Guest"}</p>
                        <p className="text-[0.6rem] text-rift-mist/40 mt-0.5">{(r as any).userEmail || ""}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs capitalize">
                        {r.type === "damaged" ? "Damaged / Defective" : "Size Replacement"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] tracking-wider uppercase border ${statusColors[r.status]}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[0.7rem] text-rift-mist/50">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <Link href={`/admin/replacements/${r._id}`}>
                        <button className="p-2 border border-rift-mist/20 rounded-xl hover:bg-white/5 transition-colors">
                          <Eye className="w-4 h-4 text-rift-mist/60" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredReplacements.length > 0 && (
          <div className="md:hidden divide-y divide-rift-mist/5">
            {filteredReplacements.map((r) => (
              <Link key={r._id} href={`/admin/replacements/${r._id}`} className="block p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[0.7rem] text-rift-mist/80">{r.requestId}</span>
                    <p className="text-sm font-medium mt-1 truncate">{(r as any).userName || "Guest"}</p>
                    <p className="text-[0.65rem] text-rift-mist/40 truncate">{(r as any).userEmail || ""}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] tracking-wider uppercase border flex-shrink-0 ${statusColors[r.status]}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[0.7rem] text-rift-mist/50">
                  <span className="capitalize">
                    {r.type === "damaged" ? "Damaged / Defective" : "Size Replacement"}
                  </span>
                  <span>
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}