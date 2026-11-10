"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { TIER_PERKS } from "@/store/loyaltyStore";
import { formatPrice } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ProductCard } from "@/components/shop/ProductCard";
import type { IOrder, IProduct } from "@/types";
import { Package, Heart, MapPin, Bell, Gift } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, setUser } = useAuthStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState<"Bronze" | "Silver" | "Gold">("Bronze");
  const [referralCode, setReferralCode] = useState("");
  const [replacementRequests, setReplacementRequests] = useState<Record<string, string>>({});
  const [wishlistItems, setWishlistItems] = useState<IProduct[]>([]);
  const [tab, setTab] = useState<"orders" | "loyalty" | "wishlist" | "addresses" | "notifications">("orders");
  const [notifications, setNotifications] = useState<{ id: string; message: string; date: string; read: boolean }[]>([]);
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddresses((user as any).addresses || []);
      setReferralCode(`RIFT${(user._id as string).slice(-4).toUpperCase()}`);

      // Fetch loyalty data from server
      fetch("/api/loyalty", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          if (data.dashboard) {
            const pts = data.dashboard.availablePoints ?? 0;
            setLoyaltyPoints(pts);
            setLoyaltyTier(pts >= 5000 ? "Gold" : pts >= 1500 ? "Silver" : "Bronze");
          }
        })
        .catch(() => {});

      fetch("/api/orders", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          setOrders(data.orders || []);
          const orderIds = (data.orders || []).map((o: IOrder) => o._id);
          Promise.all(
            orderIds.map((oid: string) =>
              fetch(`/api/replacements?orderId=${oid}`, { credentials: "include" })
                .then((r) => r.json())
                .then((d) => ({ [oid]: d.replacements?.[0]?.requestId }))
                .catch(() => ({}))
            )
          ).then((results) => {
            const map: Record<string, string> = {};
            results.forEach((r) => Object.assign(map, r));
            setReplacementRequests(map);
          });
        });

      fetch("/api/wishlist", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.wishlist)) {
            setWishlistItems(data.wishlist);
          } else {
            setWishlistItems([]);
          }
        })
        .catch(() => setWishlistItems([]));

      fetch("/api/replacements", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          const notifs = (data.replacements || []).map((r: any) => ({
            id: r._id,
            message: `Your ${r.type === "damaged" ? "damage claim" : "replacement"} request has been ${r.status}`,
            date: r.updatedAt || r.createdAt,
            read: r.status === "delivered",
          }));
          setNotifications(notifs);
        })
        .catch(() => setNotifications([]));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, phone, address: user.address || "" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to save profile");
        return;
      }

      setUser(data.user);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      let updatedAddresses = [...addresses];

      if (addressForm.isDefault) {
        updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
      }

      if (editingAddressIndex !== null) {
        updatedAddresses[editingAddressIndex] = addressForm;
      } else {
        updatedAddresses.push(addressForm);
      }

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to save address");
        return;
      }

      setUser(data.user);
      setAddresses(updatedAddresses);
      setShowAddressForm(false);
      setEditingAddressIndex(null);
      setAddressForm({ label: "", street: "", city: "", state: "", zip: "", country: "India", phone: "", isDefault: false });
      setMessage("Address saved successfully.");
    } catch {
      setMessage("Could not save address. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!user || !confirm("Delete this address?")) return;

    setSaving(true);
    const updatedAddresses = addresses.filter((_, i) => i !== index);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setAddresses(updatedAddresses);
        setMessage("Address deleted.");
      }
    } catch {
      setMessage("Could not delete address.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="pt-32 min-h-screen" />;
  }

  const wishlist = (wishlistItems.length
    ? wishlistItems
    : (user as unknown as { wishlist?: Array<Partial<IProduct> & { _id: string; name: string; slug: string; images: string[]; price: number }> }).wishlist || []) as IProduct[];

  const TABS = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "loyalty", label: "Loyalty", icon: Gift },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-1">Account</p>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-rift-mist/50 text-sm mt-1">{user.email}</p>
          </div>
          <AnimatedButton onClick={logout} variant="outline">Sign Out</AnimatedButton>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-rift-mist/10 pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs tracking-[0.15em] uppercase transition-all ${
                tab === t.id ? "bg-gradient-to-r from-rift-orange to-rift-rust text-white" : "glass-card text-rift-mist/60 hover:text-white"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-rift-mist/50 text-sm">No orders yet.</p>
            ) : (
              orders.map((order) => {
                const isDelivered = order.status === "delivered";
                const deliveryDate = new Date(order.createdAt);
                const sevenDaysLater = new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                const canRequest = isDelivered && new Date() <= sevenDaysLater;
                const hasRequest = !!replacementRequests[order._id];

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card--strong p-4 sm:p-6 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-mono text-lg font-bold">{(order as any).orderNumber || order._id}</p>
                        <p className="text-sm text-rift-mist/50 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full glass-card">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-rift-mist/60">{order.items.length} items</span>
                      <span className="font-medium">{formatPrice(order.total)}</span>
                    </div>
                    {isDelivered && (
                      <div className="mt-4 pt-4 border-t border-rift-mist/10">
                        {canRequest ? (
                          <Link href={`/support/${order._id}`}>
                            <button className="text-xs px-4 py-2 bg-gradient-to-r from-rift-orange to-rift-rust text-white rounded-xl uppercase tracking-wider hover:opacity-90 transition">
                              Request Help
                            </button>
                          </Link>
                        ) : (
                          <span className="text-xs text-rift-mist/50">Replacement Window Closed</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-rift-mist/50 text-sm">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card--strong p-6 rounded-2xl"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className={`text-sm ${n.read ? "text-rift-mist/60" : "text-white"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-rift-mist/40 mt-1">
                        {new Date(n.date).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-rift-orange shrink-0 mt-2" />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "loyalty" && (
          <div className="space-y-6">
            <div className="glass-card--strong p-5 sm:p-8 rounded-2xl text-center">
              <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Current Tier</p>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-rift-orange to-rift-rust bg-clip-text text-transparent">
                {loyaltyTier}
              </h2>
              <p className="mt-4 text-3xl font-bold">{loyaltyPoints.toLocaleString()} pts</p>
              <p className="text-sm text-rift-mist/50 mt-1">Loyalty points earned</p>
              {referralCode && (
                <div className="mt-6 inline-flex items-center gap-3 glass-card px-4 py-2 rounded-xl">
                  <span className="text-xs uppercase tracking-[0.15em] text-rift-mist/50">Referral</span>
                  <span className="font-mono text-rift-orange">{referralCode}</span>
                </div>
              )}
            </div>
            <div className="glass-card--strong p-4 sm:p-6 rounded-2xl">
              <p className="text-sm uppercase tracking-[0.15em] text-rift-mist/50 mb-4">Your Perks</p>
              <ul className="space-y-2">
                {TIER_PERKS[loyaltyTier].map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm text-rift-mist/80">
                    <Gift size={16} className="text-rift-orange shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "wishlist" && (
          <div className="space-y-4">
            {wishlist.length === 0 ? (
              <p className="text-rift-mist/50 text-sm">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {wishlist.filter(Boolean).map((p, i) => (
                  <ProductCard key={p._id || `wishlist-${i}`} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="glass-card--strong p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Phone Number</p>
                <span className={`text-xs ${phone.replace(/\D/g, "").length === 10 ? "text-emerald-400" : "text-rift-mist/40"}`}>
                  {phone.replace(/\D/g, "").length}/10
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rift-mist/40 text-sm pointer-events-none">+91</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-base tracking-[0.2em] font-mono placeholder:tracking-[0.1em]"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || phone.replace(/\D/g, "").length !== 10}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-xs font-medium uppercase tracking-[0.2em] text-white overflow-hidden transition-all duration-300 bg-gradient-to-r from-rift-orange to-rift-rust shadow-[0_0_30px_rgba(233,93,44,0.25)] hover:shadow-[0_0_40px_rgba(233,93,44,0.4)] disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span className="relative z-10">{saving ? "Saving…" : "Update Number"}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
              {message && <p className="text-sm text-rift-orange">{message}</p>}
            </div>

            <div className="flex justify-end">
              <AnimatedButton onClick={() => { setEditingAddressIndex(null); setAddressForm({ label: "", street: "", city: "", state: "", zip: "", country: "India", phone: "", isDefault: false }); setShowAddressForm(true); }} variant="outline">
                Add Address
              </AnimatedButton>
            </div>

            {addresses.length === 0 && !showAddressForm && (
              <p className="text-rift-mist/50 text-sm">No saved addresses yet.</p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card--strong p-6 rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.label || "Address"}</p>
                      {a.isDefault && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rift-orange/15 text-rift-orange">Default</span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditingAddressIndex(i); setAddressForm(a); setShowAddressForm(true); }} className="text-xs text-rift-mist/60 hover:text-white">Edit</button>
                      <button onClick={() => handleDeleteAddress(i)} className="text-xs text-rift-mist/60 hover:text-rift-rust">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-rift-mist/80">{a.street}</p>
                  <p className="text-sm text-rift-mist/60">{a.city}, {a.state} {a.zip}</p>
                  <p className="text-sm text-rift-mist/60">{a.country}{a.phone ? ` • ${a.phone}` : ""}</p>
                </motion.div>
              ))}
            </div>

            {showAddressForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card--strong p-4 sm:p-6 rounded-2xl space-y-4"
              >
                <p className="font-medium">{editingAddressIndex !== null ? "Edit Address" : "New Address"}</p>
                <div className="grid grid-cols-1 grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Label (e.g. Home)" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="glass-input" />
                  <input placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="glass-input" />
                  <input placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="glass-input md:col-span-2" />
                  <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="glass-input" />
                  <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="glass-input" />
                  <input placeholder="ZIP" value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} className="glass-input" />
                  <input placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="glass-input" />
                </div>
                <label className="flex items-center gap-2 text-sm text-rift-mist/70">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                  Set as default address
                </label>
                <div className="flex gap-3">
                  <AnimatedButton onClick={handleSaveAddress} variant="primary" disabled={saving}>
                    {saving ? "Saving…" : "Save Address"}
                  </AnimatedButton>
                  <button onClick={() => setShowAddressForm(false)} className="text-sm text-rift-mist/60 hover:text-white">Cancel</button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}