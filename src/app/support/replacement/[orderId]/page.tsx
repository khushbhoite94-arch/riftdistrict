"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import type { IOrder } from "@/types";
import { SIZES } from "@/lib/constants";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ReplacementPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { user, loading } = useAuthStore();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState("");
  const [requestedSize, setRequestedSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    fetch(`/api/orders?id=${orderId || ""}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        if (data.order?.items?.[0]?.size) {
          setCurrentSize(data.order.items[0].size);
        }
      })
      .catch(() => setOrder(null));
  }, [orderId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setError(`Invalid file type: ${invalid.name}. Allowed: JPG, PNG, WEBP`);
      return;
    }
    const tooLarge = files.find((f) => f.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setError(`File exceeds 10MB limit: ${tooLarge.name}`);
      return;
    }

    const total = [...images, ...files];
    if (total.length > 3) {
      setError("Exactly 3 images required. Remove some to add more.");
      return;
    }

    setImages(total);
    const newPreviews = total.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    setError("");
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = newImages.map((f) => URL.createObjectURL(f));
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length !== 3) {
      setError("Please upload exactly 3 images");
      return;
    }
    if (!currentSize || !requestedSize) {
      setError("Please select both current and new sizes");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("type", "replacement");
    formData.append("currentSize", currentSize);
    formData.append("requestedSize", requestedSize);
    images.forEach((img, i) => formData.append(`image${i + 1}`, img));

    try {
      const res = await fetch("/api/replacements", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit request");
        return;
      }

      router.push("/support/success");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="pt-32 min-h-screen" />;
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card--strong p-8 rounded-2xl"
        >
          <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-2">Size Replacement</p>
          <h1 className="text-2xl font-bold mb-6">Request New Size</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-rift-mist/50 uppercase tracking-wider block mb-2">
                Upload 3 Images (Required)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square bg-rift-surface rounded-xl overflow-hidden">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Array.from({ length: 3 - previews.length }).map((_, i) => (
                  <label
                    key={`upload-${i}`}
                    className="aspect-square border-2 border-dashed border-rift-mist/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-rift-orange/50 transition-colors"
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="text-2xl text-rift-mist/40">+</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-rift-mist/40 mt-2">{images.length} / 3 images uploaded</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-rift-mist/50 uppercase tracking-wider block mb-2">
                  Current Size
                </label>
                <select
                  value={currentSize}
                  onChange={(e) => setCurrentSize(e.target.value)}
                  className="input-field rounded-xl"
                  required
                >
                  <option value="">Select</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-rift-mist/50 uppercase tracking-wider block mb-2">
                  New Size
                </label>
                <select
                  value={requestedSize}
                  onChange={(e) => setRequestedSize(e.target.value)}
                  className="input-field rounded-xl"
                  required
                >
                  <option value="">Select</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting || images.length !== 3 || !currentSize || !requestedSize}
              className="w-full bg-gradient-to-r from-rift-orange to-rift-rust text-white py-4 rounded-xl font-medium uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-rift-orange/20"
            >
              {submitting ? "Submitting..." : "Request Replacement"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}