"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CartStylistSuggestions } from "@/components/personalization/CartStylistSuggestions";
import { Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, total, discount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-full glass-card--strong flex items-center justify-center mb-8"
        >
          <ShoppingBag size={40} className="text-rift-mist/50" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-rift-mist/50 mb-8 max-w-md">
          Looks like you haven't added anything yet. Browse our collection and find your next favorite piece.
        </p>
        <AnimatedButton href="/shop">Continue Shopping</AnimatedButton>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Cart</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Your Cart</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-4 sm:gap-6 glass-card--strong p-4 sm:p-6 rounded-2xl"
                >
                  <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-rift-surface rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-rift-mist/50">{item.size} · {item.color}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      <div className="flex items-center gap-3 border border-rift-mist/20 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="w-10 h-10 text-rift-mist/70 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="w-10 h-10 text-rift-mist/70 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-lg font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="mt-4 text-xs text-rift-mist/40 hover:text-rift-orange transition-colors self-start"
                    >
                      Remove item
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="glass-card--strong p-6 sm:p-8 h-fit space-y-4 rounded-2xl lg:sticky lg:top-28">
            <h2 className="text-sm tracking-[0.15em] uppercase font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-rift-mist/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-rift-mist/70">
                <span>Shipping</span>
                <span>{subtotal() >= 150 ? "Free" : formatPrice(12)}</span>
              </div>
            </div>

            <div className="flex justify-between font-medium text-xl pt-4 border-t border-rift-mist/10">
              <span>Total</span>
              <span>{formatPrice(total())}</span>
            </div>

            <AnimatedButton href="/checkout" className="w-full text-center mt-6">
              Proceed to Checkout
            </AnimatedButton>
          </div>
        </div>

        {/* AI Stylist Suggestions */}
        <CartStylistSuggestions />
      </div>
    </div>
  );
}