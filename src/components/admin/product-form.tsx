"use client";

import { useState } from "react";
import { CATEGORIES, SIZES } from "@/lib/constants";
import type { IProduct } from "@/types";

interface ProductFormProps {
  product?: IProduct;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    category: product?.category || CATEGORIES[0].slug,
    images: product?.images || [""],
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    stock: product?.stock || "",
    featured: product?.featured ?? false,
    bestSeller: product?.bestSeller ?? false,
    limitedDrop: product?.limitedDrop ?? false,
    tags: product?.tags || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setFormData((prev) => {
      const images = [...prev.images];
      images[index] = value;
      return { ...prev, images };
    });
  };

  const addImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      ...formData,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
      stock: Number(formData.stock),
      images: formData.images.filter(Boolean),
    };

    try {
      const isEdit = !!product?._id;
      const bodyData = isEdit ? { ...data, _id: product._id } : data;
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Failed to save product");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Slug</label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Price (₹)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Compare At Price (₹)</label>
          <input
            name="compareAtPrice"
            type="number"
            value={formData.compareAtPrice}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Stock</label>
          <input
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Sizes</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 text-xs border transition-all ${
                formData.sizes.includes(size)
                  ? "border-rift-orange bg-rift-orange text-white"
                  : "border-white/10 text-rift-mist/70 hover:border-rift-orange"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Colors</label>
        <input
          value={formData.colors.join(", ")}
          onChange={(e) => setFormData((prev) => ({ ...prev, colors: e.target.value.split(",").map((c) => c.trim()) }))}
          placeholder="Enter colors separated by commas (e.g. Black, White, Red)"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-rift-mist/60 mb-2">Images</label>
        <div className="space-y-3">
          {formData.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={img}
                onChange={(e) => handleImageUrlChange(i, e.target.value)}
                placeholder="Image URL"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="px-3 py-2 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="text-xs text-rift-orange hover:underline"
          >
            + Add Image
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-sm text-rift-mist/70">Featured</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="bestSeller"
            checked={formData.bestSeller}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-sm text-rift-mist/70">Best Seller</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="limitedDrop"
            checked={formData.limitedDrop}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-sm text-rift-mist/70">Limited Drop</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-rift-orange text-white text-xs tracking-wider uppercase hover:bg-rift-rust transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-white/10 text-white text-xs tracking-wider uppercase hover:border-rift-orange"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}