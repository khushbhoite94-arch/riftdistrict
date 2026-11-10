"use client";

import { useEffect } from "react";

/**
 * Locks body scroll when `locked` is true.
 * Restores original scroll behavior when `locked` becomes false.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    // Save current scroll state
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    // Lock scroll
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // Restore scroll
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}