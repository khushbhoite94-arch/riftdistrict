"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "h1",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = children.split(" ");
    el.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block translate-y-full">${w}&nbsp;</span></span>`)
      .join("");

    const spans = el.querySelectorAll("span span");
    gsap.to(spans, {
      y: 0,
      duration: 0.8,
      stagger: 0.05,
      delay,
      ease: "power3.out",
    });
  }, [children, delay]);

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
