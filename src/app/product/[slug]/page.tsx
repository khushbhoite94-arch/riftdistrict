"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SizeGuide } from "@/components/product/SizeGuide";
import { ProductCard } from "@/components/shop/ProductCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CompleteTheLook } from "@/components/personalization/CompleteTheLook";
import { StockCountdown } from "@/components/social-proof/StockCountdown";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { usePersonalizationStore } from "@/store/personalizationStore";
import { formatPrice } from "@/lib/utils";
import { SIZES } from "@/lib/constants";
import type { IProduct, IReview } from "@/types";
import { Minus, Plus, Heart } from "lucide-react";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuthStore();
  const { addRecentlyViewed } = usePersonalizationStore();

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
        setRelated(data.related || []);
        if (data.product?.sizes?.[0]) setSize(data.product.sizes[0]);
        setLoading(false);

        if (data.product) {
          addRecentlyViewed({
            productId: data.product._id,
            slug: data.product.slug,
            name: data.product.name,
            image: data.product.images[0],
            price: data.product.price,
          });
        }
      });
  }, [slug, addRecentlyViewed]);

  const handleAddToCart = () => {
    if (!product || !size) return;
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size,
      quantity,
    });
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!user) {
      setWishlistMessage("Please login to save this product to wishlist.");
      window.setTimeout(() => setWishlistMessage(""), 2500);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setWishlistMessage(data.message || data.error || "Failed to update wishlist.");
      } else {
        setWishlistMessage("Wishlist updated successfully.");
      }
    } catch {
      setWishlistMessage("Failed to update wishlist.");
    } finally {
      setWishlistLoading(false);
      window.setTimeout(() => setWishlistMessage(""), 2500);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || data.error || "Failed to submit review");
      } else {
        setReviews((prev) => [data.review, ...prev]);
        setReviewForm({ rating: 5, comment: "" });
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch {
      setReviewError("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[3/4] bg-gradient-to-br from-rift-surface to-rift-slate rounded-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent" />
          </motion.div>
          <div className="space-y-4">
            <div className="h-8 bg-rift-surface/60 rounded-full w-2/3" />
            <div className="h-4 bg-rift-surface/60 rounded-full w-1/3" />
            <div className="h-12 bg-rift-surface/60 rounded-full w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p className="text-rift-mist/50">Product not found</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6">
      <AnimatePresence>
        {wishlistMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-24 left-4 right-4 sm:left-6 sm:right-auto z-50 rounded-full glass-card--strong px-5 py-3 text-sm shadow-xl"
          >
            {wishlistMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          <ProductGallery images={product.images} name={product.name} />

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:sticky md:top-32 md:self-start"
          >
            <div className="glass-card--strong rounded-3xl p-6 sm:p-8">
              <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-2">
                {product.category.replace(/-/g, " ")}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-2xl text-rift-orange">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-rift-mist/40 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.reviewCount > 0 && (
                <p className="text-sm text-rift-mist/50 mt-2">
                  ★ {product.rating} ({product.reviewCount} reviews)
                </p>
              )}

              <p className="text-rift-mist/60 text-sm leading-relaxed mt-6">{product.description}</p>

              {/* Stock Countdown */}
              <div className="mt-6">
                <StockCountdown stock={product.stock} />
              </div>

              {/* Size Selector */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-[0.15em] uppercase text-rift-mist/50">Size</p>
                  <SizeGuide category={product.category} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes.length ? product.sizes : SIZES).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`w-12 h-12 text-xs font-medium transition-all rounded-xl ${
                        size === s
                          ? "border border-rift-orange bg-gradient-to-br from-rift-orange to-rift-rust text-white shadow-lg shadow-rift-orange/25"
                          : "border border-rift-mist/25 text-rift-mist/70 hover:border-rift-orange hover:bg-white/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center gap-4">
                <p className="text-xs tracking-[0.15em] uppercase text-rift-mist/50">Qty</p>
                <div className="flex items-center border border-rift-mist/25 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 text-rift-mist/70 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 text-rift-mist/70 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <AnimatedButton onClick={handleAddToCart} className="flex-1 text-center">
                  Add to Cart
                </AnimatedButton>
                <AnimatedButton
                  onClick={toggleWishlist}
                  variant="glass"
                  className="flex-1 text-center"
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? "Saving..." : "Wishlist"}
                </AnimatedButton>
              </div>

              {/* Delivery info */}
              <div className="mt-10 space-y-3 text-sm text-rift-mist/50 border-t border-rift-mist/10 pt-8">
                <p>✓ Free shipping on orders over ₹999</p>
                <p>✓ 7-day returns</p>
                <p>✓ Authentic RIFT DISTRICT piece</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-16 sm:mt-24 border-t border-rift-mist/10 pt-12 sm:pt-16">
          <h2 className="text-2xl font-bold mb-8">Reviews</h2>

          {/* Write a review */}
          <div className="max-w-2xl mb-12">
            {user ? (
              <form onSubmit={submitReview} className="glass-card--strong p-6 sm:p-8 space-y-4 rounded-2xl">
                <p className="text-sm tracking-[0.15em] uppercase text-rift-mist/50">Write a Review</p>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className={`text-2xl transition-all hover:scale-110 ${
                        star <= reviewForm.rating ? "text-yellow-400" : "text-rift-mist/20"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Share your thoughts on this piece..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="input-field resize-none w-full rounded-xl"
                />

                {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-green-400">Review submitted!</p>}

                <AnimatedButton type="submit" disabled={reviewLoading} className="w-full text-center">
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </AnimatedButton>
              </form>
            ) : (
              <div className="glass-card--strong p-8 text-center rounded-2xl">
                <p className="text-sm text-rift-mist/50">
                  <a href="/login" className="text-rift-orange hover:underline">Sign in</a> to leave a review.
                </p>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-rift-mist/50 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-rift-mist/10 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium">{r.userName}</span>
                    <span className="text-yellow-400 text-xs">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p className="text-sm text-rift-mist/60">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Complete the Look */}
        {product && <CompleteTheLook currentProduct={product} />}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}