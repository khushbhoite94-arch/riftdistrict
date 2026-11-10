"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePortal } from "@/hooks/usePortal";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    total,
    couponCode,
    discount,
    setCoupon,
    clearCoupon,
  } = useCartStore();

  const [code, setCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useScrollLock(isOpen);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: subtotal() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupon(code.toUpperCase(), data.discount);
      } else {
        setCouponError(data.error);
        clearCoupon();
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const portal = usePortal();

  return portal ? createPortal(
    <div style={{ pointerEvents: "auto" }}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
              onClick={closeCart}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-md glass-card--strong border-l border-rift-mist/10 z-[60] flex flex-col"
            >
            <div className="flex items-center justify-between p-6 border-b border-rift-mist/10">
              <h2 className="text-sm tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                <ShoppingBag size={16} />
                Cart ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={24} className="text-rift-mist/50" />
                  </div>
                  <p className="text-rift-mist/50 text-sm mb-6">Your cart is empty</p>
                  <AnimatedButton href="/shop" onClick={closeCart}>
                    Shop Now
                  </AnimatedButton>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4"
                  >
                    <div className="relative w-20 h-24 flex-shrink-0 bg-rift-surface rounded-xl overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.name}</h3>
                      <p className="text-xs text-rift-mist/50 mt-1">
                        {item.size} · {item.color}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-rift-mist/20 rounded-xl">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            className="w-8 h-8 text-rift-mist/70 hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            className="w-8 h-8 text-rift-mist/70 hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-xs text-rift-mist/40 hover:text-rift-orange mt-2 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-rift-mist/10 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Coupon code"
                    className="input-field flex-1 text-xs rounded-xl"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 border border-rift-mist/20 text-xs tracking-wider uppercase rounded-xl hover:border-rift-orange transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                {couponCode && (
                  <p className="text-xs text-rift-mist/60">Applied: {couponCode}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-rift-mist/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rift-mist/70">
                    <span>Shipping</span>
                    <span>{subtotal() >= 150 ? "Free" : formatPrice(12)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-rift-mist/10">
                    <span>Total</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                </div>

                <AnimatedButton href="/checkout" onClick={closeCart} className="w-full text-center">
                  Checkout
                </AnimatedButton>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 text-xs text-rift-mist/50 hover:text-rift-mist/70 tracking-wider uppercase transition-colors"
                >
                  View Full Cart <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    </div>,
    portal
  ) : null;
}