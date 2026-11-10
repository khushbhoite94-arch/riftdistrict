"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, Plus, Edit, Trash2, X, Upload, Filter } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type { IProduct } from "@/types";

function AdminProductsContent() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{products.length} total products</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl font-medium shadow-lg shadow-rift-orange/20"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer"
          >
            <option value="" className="bg-rift-base">All Categories</option>
            <option value="oversized-tees" className="bg-rift-base">Oversized Tees</option>
            <option value="acid-wash" className="bg-rift-base">Acid Wash</option>
            <option value="hoodies" className="bg-rift-base">Hoodies</option>
            <option value="sweatshirts" className="bg-rift-base">Sweatshirts</option>
            <option value="limited-drop" className="bg-rift-base">Limited Drop</option>
          </select>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card--strong p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium tracking-wider uppercase">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-rift-mist/50" />
                </button>
              </div>
              <ProductForm
                product={editingProduct ?? undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <div className="glass-card--strong rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-rift-surface/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-rift-mist/40">No products found</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Product</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Category</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Price</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Stock</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Status</th>
                  <th className="text-right py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rift-surface overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <Image src={product.images[0]} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-xs font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs text-rift-mist/60 capitalize">{(product.category || "").replace(/-/g, " ")}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs font-medium">₹{product.price?.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`text-xs ${(product.stock ?? 0) < 10 ? "text-rift-orange" : "text-rift-mist/60"}`}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex gap-1.5">
                        {product.featured && <span className="px-2 py-0.5 rounded-md bg-rift-orange/10 text-rift-orange text-[0.6rem] uppercase tracking-wider">Featured</span>}
                        {product.bestSeller && <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[0.6rem] uppercase tracking-wider">Best</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-rift-mist/50" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredProducts.length > 0 && (
          <div className="md:hidden divide-y divide-rift-mist/5">
            {filteredProducts.map((product) => (
              <div key={product._id} className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-rift-surface overflow-hidden flex-shrink-0">
                  {product.images?.[0] && (
                    <Image src={product.images[0]} alt={product.name} width={56} height={56} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-rift-mist/60 capitalize mt-0.5">{(product.category || "").replace(/-/g, " ")}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium">₹{product.price?.toLocaleString()}</span>
                    <span className={`text-xs ${(product.stock ?? 0) < 10 ? "text-rift-orange" : "text-rift-mist/50"}`}>
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>
                  {(product.featured || product.bestSeller) && (
                    <div className="flex gap-1.5 mt-1.5">
                      {product.featured && <span className="px-2 py-0.5 rounded-md bg-rift-orange/10 text-rift-orange text-[0.6rem] uppercase tracking-wider">Featured</span>}
                      {product.bestSeller && <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[0.6rem] uppercase tracking-wider">Best</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-rift-mist/50" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className="p-2.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400/70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsContent />
    </Suspense>
  );
}

function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: IProduct;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "oversized-tees",
    stock: product?.stock?.toString() || "50",
    images: (product?.images as string[]) || [],
    sizes: (product?.sizes || []).join(","),
    colors: (product?.colors || []).join(","),
    featured: product?.featured || false,
    bestSeller: product?.bestSeller || false,
    limitedDrop: product?.limitedDrop || false,
    salesRank: product?.salesRank?.toString() || "",
  });
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const remaining = 7 - form.images.length;
      const selected = Array.from(files).slice(0, Math.max(0, remaining));
      const urls = await Promise.all(
        selected.map((file) => {
          const fd = new FormData();
          fd.append("file", file);
          return fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json()).then((d) => d.url);
        })
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 7) }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.price) {
      alert("Please fill required fields");
      return;
    }
    try {
      const body = {
        ...(product?._id ? { _id: product._id } : {}),
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
        images: form.images.filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()),
        colors: form.colors.split(",").map((c) => c.trim()),
        featured: form.featured,
        bestSeller: form.bestSeller,
        limitedDrop: form.limitedDrop,
        salesRank: form.salesRank ? parseInt(form.salesRank) : undefined,
      };
      await fetch("/api/admin/products", {
        method: product?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch {
      alert("Failed to save product");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Product name"
          />
        </div>
        <div>
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Price *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input-field"
            placeholder="0"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field h-24 resize-none"
            placeholder="Product description"
          />
        </div>
        <div>
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
          >
            {["oversized-tees", "acid-wash", "hoodies", "sweatshirts", "limited-drop"].map((c) => (
              <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="input-field"
            placeholder="50"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider">Images ({form.images.length}/7)</label>
          {form.images.length > 0 && (
            <div className="grid grid-cols-7 gap-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-rift-surface group">
                  <Image src={img} alt={`Product ${idx + 1}`} width={60} height={60} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {form.images.length < 7 && (
            <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-rift-mist/20 rounded-xl cursor-pointer hover:border-rift-orange/30 transition-colors">
              <Upload className="w-4 h-4 text-rift-mist/50" />
              <span className="text-xs text-rift-mist/60">{uploading ? "Uploading..." : "Upload images"}</span>
              <input type="file" accept="image/*" multiple onChange={uploadImage} disabled={uploading} className="hidden" />
            </label>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Sizes (comma separated)</label>
          <input
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="input-field"
            placeholder="S, M, L, XL"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Colors (comma separated)</label>
          <input
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="input-field"
            placeholder="Black, White, Gray"
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="accent-rift-orange w-4 h-4"
            />
            <span className="text-xs text-rift-mist/70">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })}
              className="accent-rift-orange w-4 h-4"
            />
            <span className="text-xs text-rift-mist/70">Best Seller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.limitedDrop}
              onChange={(e) => setForm({ ...form, limitedDrop: e.target.checked })}
              className="accent-rift-orange w-4 h-4"
            />
            <span className="text-xs text-rift-mist/70">Limited Drop</span>
          </label>
        </div>
        {form.bestSeller && (
          <div className="md:col-span-2">
            <label className="text-[0.65rem] text-rift-mist/50 uppercase tracking-wider mb-1.5 block">Sales Rank (1-4)</label>
            <input
              type="number"
              min="1"
              max="4"
              value={form.salesRank}
              onChange={(e) => setForm({ ...form, salesRank: e.target.value })}
              className="input-field max-w-[120px]"
            />
          </div>
        )}
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-wider uppercase rounded-xl font-medium shadow-lg shadow-rift-orange/20"
          >
            {product?._id ? "Update Product" : "Add Product"}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-rift-mist/20 text-xs tracking-wider uppercase rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}