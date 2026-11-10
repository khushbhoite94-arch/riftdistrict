"use client";

import { useEffect, useState } from "react";

export function usePortal() {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.pointerEvents = "none";
    el.style.zIndex = "1400";
    el.setAttribute("data-portal-root", "true");
    setPortal(el);
    document.body.appendChild(el);

    return () => {
      el.remove();
    };
  }, []);

  return portal;
}
