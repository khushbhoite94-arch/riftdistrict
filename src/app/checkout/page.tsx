"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { CreditCard, Smartphone, Wallet, Package, CheckCircle2, Clock, Truck, MapPin } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;
const COD_FEE = 50;
const GIFT_WRAP_FEE = 50;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, couponCode, clearCart, setCoupon } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [form, setForm] = useState({
    street: "", city: "", state: "", zip: "", country: "India", phone: "",
    cardNumber: "", expiry: "", cvv: "",
  });
  const [recalculatedDiscount, setRecalculatedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsError, setPointsError] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);

  const sub = subtotal();

  // Fetch available loyalty points from server
  useEffect(() => {
    if (!user) return;
    fetch("/api/loyalty", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.dashboard) {
          setAvailablePoints(data.dashboard.availablePoints);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (user && (user as any).addresses?.length > 0) {
      const addresses = (user as any).addresses;
      const defaultIndex = addresses.findIndex((a: any) => a.isDefault);
      const indexToSelect = defaultIndex !== -1 ? defaultIndex : 0;
      setSelectedAddressIndex(indexToSelect);
      const addr = addresses[indexToSelect];
      setForm({ ...form, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, phone: addr.phone });
    }
  }, [user]);

  useEffect(() => {
    const recalculateDiscount = async () => {
      if (!couponCode) {
        setRecalculatedDiscount(0);
        setDiscountError("");
        return;
      }

      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode, subtotal: sub }),
        });

        const data = await response.json();
        
        if (response.ok && data.valid) {
          setRecalculatedDiscount(data.discount);
          setDiscountError("");
          if (data.discount !== discount) {
            setCoupon(couponCode, data.discount);
          }
        } else {
          setRecalculatedDiscount(0);
          setDiscountError(data.message || "Invalid coupon");
          setCoupon("", 0);
        }
      } catch {
        setRecalculatedDiscount(0);
        setDiscountError("Failed to validate coupon");
      }
    };

    recalculateDiscount();
  }, [couponCode, sub, discount, setCoupon]);

  // --- All derived values & hooks MUST be above any early return ---
  const finalDiscount = recalculatedDiscount;

  const maxRedeemable = useMemo(() => {
    const maxByBalance = availablePoints;
    const maxByOrderValue = Math.floor(sub - finalDiscount) * 100;
    return Math.min(maxByBalance, maxByOrderValue);
  }, [availablePoints, sub, finalDiscount]);

  // Validate points on every change
  useEffect(() => {
    if (pointsToRedeem <= 0) {
      setPointsError("");
      return;
    }
    if (pointsToRedeem < 100) {
      setPointsError("Minimum redemption is 100 points");
    } else if (pointsToRedeem > availablePoints) {
      setPointsError(`You only have ${availablePoints} points`);
    } else if (Math.floor(pointsToRedeem / 100) > sub - finalDiscount) {
      setPointsError("Discount exceeds order total");
    } else {
      setPointsError("");
    }
  }, [pointsToRedeem, availablePoints, sub, finalDiscount]);

  if (items.length === 0) {
    return (
      <div className="pt-28 sm:pt-32 pb-24 text-center px-4 sm:px-6">
        <p className="text-rift-mist/50">Your cart is empty</p>
      </div>
    );
  }

  const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const giftFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const pointsDiscount = Math.floor(pointsToRedeem / 100);
  const orderTotal = Math.max(0, sub - finalDiscount - pointsDiscount + shipping + codFee + giftFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login?redirect=/checkout"); return; }
    if (!agreedToTerms) { return; }
    
    if (couponCode && finalDiscount === 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })),
          shippingAddress: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country, phone: form.phone },
          paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "card" ? "Demo Card" : "Demo UPI",
          couponCode: couponCode || undefined,
          discount: finalDiscount,
          pointsRedeemed: pointsToRedeem,
          giftWrap,
          giftMessage: giftWrap ? giftMessage : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        router.push(`/checkout/success?order=${data.order.orderNumber}`);
        return;
      }
      const errorData = await res.json().catch(() => null);
      alert(errorData?.message || errorData?.error || "Checkout failed. Please try again.");
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { id: "card", label: "Card", icon: CreditCard },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "cod", label: "Cash on Delivery", icon: Wallet },
  ];

  const STEPS = [
    { id: "shipping", label: "Shipping", icon: Package },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 sm:mb-16 px-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full glass-card--strong flex items-center justify-center mb-2">
                  <step.icon size={18} className="text-rift-mist/70" />
                </div>
                <span className="text-[0.6rem] sm:text-xs uppercase tracking-[0.15em] text-rift-mist/50">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-6 sm:w-24 h-0.5 bg-rift-mist/20 mx-2 sm:mx-4 -mt-6" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <section>
              <h2 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-6">Shipping Address</h2>
              
              {user && (user as any).addresses?.length > 0 && (
                <div className="space-y-3 mb-6">
                  {(user as any).addresses.map((addr: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedAddressIndex(index);
                        setShowNewAddressForm(false);
                        setForm({ ...form, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, phone: addr.phone });
                      }}
                      className={`p-4 sm:p-6 rounded-2xl cursor-pointer transition-all border ${
                        selectedAddressIndex === index && !showNewAddressForm
                          ? "border-rift-orange bg-rift-orange/5"
                          : "border-rift-mist/20 hover:border-rift-mist/40 glass-card"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 bg-rift-orange/20 text-rift-orange rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-rift-mist/60">
                            {addr.street}, {addr.city}, {addr.state} {addr.zip}
                          </p>
                          <p className="text-sm text-rift-mist/60 mt-1">📞 {addr.phone}</p>
                        </div>
                        {selectedAddressIndex === index && !showNewAddressForm && (
                          <CheckCircle2 className="w-5 h-5 text-rift-orange" />
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setSelectedAddressIndex(null);
                      setForm({ ...form, street: "", city: "", state: "", zip: "", country: "India", phone: user?.phone || "" });
                    }}
                    className="w-full p-4 rounded-2xl glass-card text-sm transition-all hover:border-rift-orange"
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {(showNewAddressForm || !(user as any)?.addresses?.length) && (
                <div className="glass-card--strong p-4 sm:p-6 space-y-4 rounded-2xl">
                  <input required placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-field rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field rounded-xl" />
                    <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="PIN Code" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="input-field rounded-xl" />
                    <input required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field rounded-xl" />
                  </div>
                  <input required type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field rounded-xl" />
                </div>
              )}
            </section>

            {/* Gift Wrap */}
            <section className="glass-card--strong p-6 rounded-2xl">
              <label className="flex items-center gap-4 cursor-pointer">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="accent-rift-orange w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">Gift Wrapping</p>
                  <p className="text-xs text-rift-mist/50">Premium branded packaging + handwritten note</p>
                </div>
                <span className="text-rift-orange">+{formatPrice(GIFT_WRAP_FEE)}</span>
              </label>
              {giftWrap && (
                <textarea
                  rows={3}
                  placeholder="Add a gift message (optional)..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="input-field resize-none w-full mt-4 rounded-xl"
                />
              )}
            </section>

            {/* Loyalty Points */}
            {user && availablePoints >= 100 && (
              <section className="glass-card--strong p-4 sm:p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">Redeem Loyalty Points</p>
                    <p className="text-xs text-rift-mist/50">You have {availablePoints} points (100 pts = ₹1)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={maxRedeemable}
                    step="100"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                    placeholder="Min 100 pts"
                    className="input-field flex-1 rounded-xl"
                  />
                  {pointsToRedeem >= 100 && !pointsError && (
                    <p className="text-xs text-green-400 self-center">-{formatPrice(Math.floor(pointsToRedeem / 100))}</p>
                  )}
                </div>
                {pointsError && <p className="text-xs text-red-400 mt-2">{pointsError}</p>}
                {pointsToRedeem <= 0 && (
                  <p className="text-[0.65rem] text-rift-mist/40 mt-1">100 points = ₹1 discount</p>
                )}
              </section>
            )}

            {/* Payment */}
            <section>
              <h2 className="text-sm tracking-[0.15em] uppercase text-rift-mist/50 mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentOptions.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border text-xs uppercase tracking-wider transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === method.id ? "border-rift-orange bg-rift-orange/10 text-white" : "border-rift-mist/20 text-rift-mist/60 glass-card"
                    }`}
                  >
                    <method.icon size={20} />
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-4 space-y-4">
                  <input placeholder="Card Number (Demo: 4242 4242 4242 4242)" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} className="input-field rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="input-field rounded-xl" />
                    <input placeholder="CVV" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} className="input-field rounded-xl" />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <input placeholder="UPI ID (e.g. name@upi)" className="input-field rounded-xl mt-4" />
              )}

              {paymentMethod === "cod" && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-rift-mist/70">
                  Pay ₹{orderTotal} in cash when your order arrives. A convenience fee of {formatPrice(COD_FEE)} applies.
                </div>
              )}
            </section>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 accent-rift-orange w-4 h-4 flex-shrink-0" />
              <span className="text-xs text-rift-mist/60 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-rift-orange hover:underline">Terms & Conditions</Link>
              </span>
            </label>
          </div>

          {/* Order Summary */}
          <div className="glass-card--strong p-6 sm:p-8 h-fit space-y-4 rounded-2xl lg:sticky lg:top-28">
            <h2 className="text-sm tracking-[0.15em] uppercase font-medium mb-4">Order Summary</h2>
            
            {user && form.phone && (
              <div className="pb-4 border-b border-rift-mist/10">
                <p className="text-xs tracking-wider uppercase text-rift-mist/50 mb-2">Order Info</p>
                <p className="text-sm text-rift-mist/70">{user.name}</p>
                <p className="text-sm text-rift-mist/70">📞 {form.phone}</p>
                {form.street && (
                  <p className="text-xs text-rift-mist/60 mt-2">
                    {form.street}, {form.city}, {form.state} {form.zip}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-rift-mist/70">{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-rift-mist/10 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-rift-mist/70">
                  <span>Subtotal</span><span>{formatPrice(sub)}</span>
                </div>
                {finalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount</span><span>-{formatPrice(finalDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Points</span><span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-rift-mist/70">
                  <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-sm text-rift-mist/70">
                    <span>COD Fee</span><span>{formatPrice(codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-rift-mist/10">
                  <span>Total</span><span>{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>

            <AnimatedButton type="submit" disabled={loading || !agreedToTerms || !!pointsError} className="w-full text-center mt-6">
              {loading ? "Processing..." : paymentMethod === "cod" ? "Place Order (COD)" : "Place Order"}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </div>
  );
}