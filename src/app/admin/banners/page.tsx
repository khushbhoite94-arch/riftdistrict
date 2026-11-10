"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Eye, EyeOff, RefreshCw, UploadCloud } from "lucide-react";
import Image from "next/image";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d) => { setBanners(d.banners || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "riftdistrict/banners");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData?.error || "Upload failed");

      await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadData.url }),
      });

      const d = await fetch("/api/admin/banners").then((r) => r.json());
      setBanners(d.banners || []);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleBanner = async (banner: any) => {
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: banner._id, active: !(banner.active ?? true) }),
      });
      setBanners((prev) => prev.map((b) => b._id === banner._id ? { ...b, active: !b.active } : b));
    } catch {
      alert("Failed to update");
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{banners.length} total banners</p>
        </div>
        <label className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl font-medium shadow-lg shadow-rift-orange/20 cursor-pointer">
          {uploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Upload Banner"}
          <input type="file" accept="image/*" onChange={uploadBanner} disabled={uploading} className="hidden" />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-rift-surface/60 rounded-2xl animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="glass-card--strong rounded-2xl py-20 text-center">
          <UploadCloud className="w-10 h-10 text-rift-mist/20 mx-auto mb-4" />
          <p className="text-sm text-rift-mist/50 mb-2">No banners uploaded yet</p>
          <p className="text-xs text-rift-mist/40 mb-6">Upload your first homepage banner to get started</p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 border border-rift-mist/20 rounded-xl text-xs tracking-wider uppercase cursor-pointer hover:bg-white/5 transition-colors">
            <Upload className="w-4 h-4" />
            Upload Banner
            <input type="file" accept="image/*" onChange={uploadBanner} disabled={uploading} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, i) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card--strong rounded-2xl overflow-hidden group"
            >
              <div className="relative aspect-[16/9] bg-rift-surface cursor-pointer" onClick={() => setPreviewBanner(banner.image)}>
                <Image
                  src={banner.image}
                  alt={`Banner ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] tracking-wider uppercase border ${
                    banner.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rift-slate/10 text-rift-mist/50 border-rift-slate/20"
                  }`}>
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-[0.65rem] text-rift-mist/50 font-mono truncate max-w-[180px]">
                  {banner.image?.split("/").pop()}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleBanner(banner)}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.active ? "hover:bg-amber-500/10" : "hover:bg-emerald-500/10"
                    }`}
                  >
                    {banner.active ? (
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteBanner(banner._id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setPreviewBanner(null)}
          >
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <EyeOff className="w-5 h-5 text-white" />
            </button>
            <div className="relative max-w-5xl max-h-[85vh] w-full">
              <Image
                src={previewBanner}
                alt="Banner preview"
                width={1200}
                height={600}
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}