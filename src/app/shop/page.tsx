"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductCard } from "@/components/shop/ProductCard";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import type { IProduct } from "@/types";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("newest");
  const [banners, setBanners] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/banners`);
      const data = await res.json();
      setBanners((data?.banners || []).map((b: any) => b.image).filter(Boolean));
    } catch {
      setBanners([]);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("sort", sort);
    params.set("limit", "24");

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, [category, search, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setSort("newest");
  };

  const activeFiltersCount = (category ? 1 : 0) + (search ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Collection</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Shop</h1>
          <p className="text-rift-mist/60 mt-3 max-w-xl text-sm">
            Explore our latest drops. Premium streetwear built for those who dare to stand apart.
          </p>
        </motion.div>

        {/* Banner */}
        {banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-2xl">
              <Image
                src={banners[0]}
                alt="Shop Banner"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-rift-base/80 via-rift-base/40 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8 md:px-12">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-rift-orange mb-2">New Drop</p>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">RIFT DISTRICT</h2>
                  <p className="text-sm text-rift-mist/80">Luxury Streetwear — Built Different</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              {/* Search */}
              <div className="glass-card--strong p-5 rounded-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="glass-card--strong p-5 rounded-2xl">
                <label className="text-xs tracking-[0.15em] uppercase text-rift-mist/50 mb-3 block">Sort By</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-rift-base">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/50 pointer-events-none" />
                </div>
              </div>

              {/* Categories */}
              <div className="glass-card--strong p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs tracking-[0.15em] uppercase text-rift-mist/50">Categories</h3>
                  {category && (
                    <button
                      onClick={() => setCategory("")}
                      className="text-[10px] text-rift-orange hover:underline uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory("")}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      !category
                        ? "bg-rift-orange/15 text-rift-orange border border-rift-orange/20"
                        : "text-rift-mist/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    All Products
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                        category === cat.slug
                          ? "bg-rift-orange/15 text-rift-orange border border-rift-orange/20"
                          : "text-rift-mist/60 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="glass-card--strong p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs tracking-[0.15em] uppercase text-rift-mist/50">Active Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-rift-orange hover:underline uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rift-orange/15 text-rift-orange text-xs border border-rift-orange/20">
                        {CATEGORIES.find(c => c.slug === category)?.name}
                        <button onClick={() => setCategory("")} className="hover:text-white">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {search && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rift-orange/15 text-rift-orange text-xs border border-rift-orange/20">
                        &quot;{search}&quot;
                        <button onClick={() => setSearch("")} className="hover:text-white">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {sort !== "newest" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rift-orange/15 text-rift-orange text-xs border border-rift-orange/20">
                        {SORT_OPTIONS.find(o => o.value === sort)?.label}
                        <button onClick={() => setSort("newest")} className="hover:text-white">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-xs tracking-wider uppercase"
                  >
                    <SlidersHorizontal size={14} />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rift-orange text-white text-[10px] flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile search */}
                  <div className="lg:hidden relative w-full sm:w-40">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                      className="glass-input pl-10 pr-4 py-2 rounded-xl text-sm w-full sm:w-40"
                    />
                  </div>

                  {/* Sort — mobile */}
                  <div className="relative lg:hidden w-full sm:w-auto">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="glass-input pl-4 pr-8 py-2 rounded-xl text-sm appearance-none cursor-pointer w-full sm:w-auto"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-rift-base">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/50 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Mobile Category Pills */}
              <div className="lg:hidden flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                <button
                  onClick={() => setCategory("")}
                  className={`px-4 py-2 rounded-xl text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all border ${
                    !category
                      ? "bg-rift-orange text-rift-base border-transparent"
                      : "glass-card text-rift-mist/60 border-transparent"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(cat.slug)}
                    className={`px-4 py-2 rounded-xl text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all border ${
                      category === cat.slug
                        ? "bg-rift-orange text-rift-base border-transparent"
                        : "glass-card text-rift-mist/60 border-transparent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:hidden glass-card--strong p-5 rounded-2xl mb-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs tracking-[0.15em] uppercase text-rift-mist/50">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-8 h-8 rounded-full glass-card flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div>
                  <label className="text-xs tracking-[0.15em] uppercase text-rift-mist/50 mb-3 block">Sort By</label>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-rift-base">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/50 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs tracking-[0.15em] uppercase text-rift-mist/50 mb-3">Categories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setCategory(""); setMobileFiltersOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                        !category
                          ? "bg-rift-orange/15 text-rift-orange border border-rift-orange/20"
                          : "text-rift-mist/60 hover:text-white border border-transparent"
                      }`}
                    >
                      All Products
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => { setCategory(cat.slug); setMobileFiltersOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                          category === cat.slug
                            ? "bg-rift-orange/15 text-rift-orange border border-rift-orange/20"
                            : "text-rift-mist/60 hover:text-white border border-transparent"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-[3/4] rounded-2xl glass-card--strong animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-full glass-card--strong flex items-center justify-center mx-auto mb-6">
                  <Search size={28} className="text-rift-mist/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-sm text-rift-mist/50 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-rift-orange to-rift-rust text-white text-xs tracking-[0.15em] uppercase rounded-xl shadow-lg shadow-rift-orange/20"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
              >
                {products.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-24 px-6 min-h-screen" />}>
      <ShopContent />
    </Suspense>
  );
}