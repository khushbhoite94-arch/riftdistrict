"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  Image,
  ChevronLeft,
  ChevronRight,
  Store,
  Menu,
  X,
  MessageSquare,
  Award,
} from "lucide-react";

const navItems = [
   { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
   { name: "Products", href: "/admin/products", icon: Package },
   { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
   { name: "Customers", href: "/admin/customers", icon: Users },
   { name: "Support", href: "/admin/replacements", icon: MessageSquare },
   { name: "Coupons", href: "/admin/coupons", icon: Ticket },
   { name: "Banners", href: "/admin/banners", icon: Image },
   { name: "Loyalty", href: "/admin/loyalty", icon: Award },
 ];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 glass-card--strong border-b border-rift-mist/10 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rift-orange to-rift-rust flex items-center justify-center shadow-lg shadow-rift-orange/20">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-[0.15em] text-white">
            RIFT<span className="text-rift-orange">.</span>ADMIN
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-11 h-11 flex items-center justify-center text-rift-mist/70 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar (and mobile drawer) */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 top-0 h-screen glass-card--strong border-r border-rift-mist/10 z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-rift-mist/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rift-orange to-rift-rust flex items-center justify-center flex-shrink-0 shadow-lg shadow-rift-orange/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sm tracking-[0.15em] text-white whitespace-nowrap"
                >
                  RIFT<span className="text-rift-orange">.</span>ADMIN
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden w-9 h-9 flex items-center justify-center text-rift-mist/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 relative ${
                    isActive
                      ? "bg-rift-orange/10 text-rift-orange"
                      : "text-rift-mist/60 hover:text-white hover:bg-white/5"
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[0.8rem] tracking-wide whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-5 bg-rift-orange rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-rift-mist/10 space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rift-mist/60 hover:text-white hover:bg-white/5 transition-colors">
              <Store className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[0.8rem] tracking-wide whitespace-nowrap"
                  >
                    View Store
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rift-mist/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px] mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] flex-shrink-0" />
                <AnimatePresence>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[0.8rem] tracking-wide whitespace-nowrap"
                  >
                    Collapse
                  </motion.span>
                </AnimatePresence>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
