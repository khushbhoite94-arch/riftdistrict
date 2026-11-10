"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorFollower() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    document.body.classList.add("custom-cursor-active");
    setVisible(true);

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onEnter = () => setHovering(true);
    const onLeave = () => setHovering(false);

    window.addEventListener("mousemove", move);

    const interactives = document.querySelectorAll("a, button, [data-cursor]");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [cursorX, cursorY]);

  if (!visible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-rift-orange pointer-events-none z-[9999]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-rift-mist/30 pointer-events-none z-[9998]"
        animate={{
          width: hovering ? 48 : 32,
          height: hovering ? 48 : 32,
        }}
        transition={{ duration: 0.2 }}
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}