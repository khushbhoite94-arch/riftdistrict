"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "glass";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function AnimatedButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: AnimatedButtonProps) {
  const magneticRef = useMagnetic(0.25);

  const base =
    "relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 btn-magnetic overflow-hidden group";

  const variants = {
    primary:
      "bg-rift-orange text-white hover:bg-rift-rust shadow-[0_0_30px_rgba(233,93,44,0.25)]",
    outline:
      "border border-rift-mist/40 text-rift-mist hover:border-rift-orange hover:text-white hover:bg-rift-orange/10",
    ghost: "text-rift-mist/70 hover:text-rift-mist",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
  };

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        />
      )}
    </>
  );

  const classes = cn(base, variants[variant], className, disabled && "opacity-50 pointer-events-none");

  if (href) {
    return (
      <Link href={href} ref={magneticRef as React.Ref<HTMLAnchorElement>} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={magneticRef as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}
