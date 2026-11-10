"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isLoggedIn = Boolean(user);
  const { items, openCart } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[40] bg-transparent backdrop-blur-none">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-bold tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm"
        >
          RIFT DISTRICT
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.15em] text-white">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-orange-500 transition"
            >
              {link.label}
            </Link>
          ))}

          {authLoading ? null : !isLoggedIn ? (
            <>
              <Link href="/login" className="hover:text-orange-500 transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="border border-orange-500 text-orange-500 px-5 py-2 rounded-full hover:bg-orange-500 hover:text-white transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="hover:text-orange-500 transition">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-orange-500 hover:opacity-80 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Cart Icon */}
        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative flex items-center justify-center w-10 h-10 text-white hover:text-orange-500 transition"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-white hover:text-orange-500 transition"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 top-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-[64px] left-0 right-0 z-50 mx-4 rounded-2xl glass-panel overflow-hidden"
            >
              <div className="flex flex-col py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-6 py-4 text-sm uppercase tracking-[0.15em] text-white hover:text-orange-500 hover:bg-white/5 transition"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="h-px bg-rift-mist/10 my-2 mx-6" />

                {!isLoggedIn ? (
                  <div className="flex flex-col gap-3 px-6 pt-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center py-3.5 text-sm uppercase tracking-[0.15em] text-white border border-rift-mist/20 rounded-full hover:bg-white/5 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center py-3.5 text-sm uppercase tracking-[0.15em] border border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition"
                    >
                      Signup
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 px-6">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-4 text-sm uppercase tracking-[0.15em] text-white hover:text-orange-500 transition"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="py-4 text-left text-sm uppercase tracking-[0.15em] text-orange-500 hover:opacity-80 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
