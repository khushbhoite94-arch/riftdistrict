"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { CursorFollower } from "@/components/ui/CursorFollower";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { StyleQuiz } from "@/components/personalization/StyleQuiz";
import { LivePurchaseNotifications } from "@/components/social-proof/LivePurchaseNotifications";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  useSmoothScroll();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <LoadingScreen />
      <CursorFollower />
      <CartDrawer />
      <StyleQuiz />
      <LivePurchaseNotifications />
      {children}
    </>
  );
}
