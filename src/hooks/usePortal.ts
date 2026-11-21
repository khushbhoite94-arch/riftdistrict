"use client";

import { useEffect, useState, useRef } from "react";

export function usePortal() {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    mountedRef.current = true;

    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.pointerEvents = "none";
    el.style.zIndex = "1400";
    el.setAttribute("data-portal-root", "true");

    requestAnimationFrame(() => {
      if (mountedRef.current) setPortal(el);
    });
    document.body.appendChild(el);

    return () => {
      mountedRef.current = false;
      el.remove();
    };
  }, []);

  return portal;
}
