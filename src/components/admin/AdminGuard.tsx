"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-rift-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rift-orange/30 border-t-rift-orange animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
