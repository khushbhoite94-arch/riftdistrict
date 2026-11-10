import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Magnetic button effect - button follows cursor
 */
export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      x.set(distanceX * strength);
      y.set(distanceY * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [x, y, strength]);

  return { ref, x: springX, y: springY };
}

/**
 * Parallax scroll effect
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const offset = (scrolled - elementTop + windowHeight) * speed;
        y.set(offset);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [y, speed]);

  return { ref, y };
}

/**
 * 3D tilt effect on hover
 */
export function useTilt(maxTilt: number = 15) {
  const ref = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 400 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      rotateY.set(percentX * maxTilt);
      rotateX.set(-percentY * maxTilt);
    };

    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rotateX, rotateY, maxTilt]);

  return { ref, rotateX: springRotateX, rotateY: springRotateY };
}

/**
 * Scroll-triggered animations
 */
export function useScrollTrigger(threshold: number = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useMotionValue(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView.set(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isInView, threshold]);

  return { ref, isInView };
}

/**
 * Mouse position tracker
 */
export function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return { x, y };
}

/**
 * Cursor trail effect
 */
export function useCursorTrail(length: number = 10) {
  const trail = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      trail.current = [
        { x: e.clientX, y: e.clientY },
        ...trail.current.slice(0, length - 1),
      ];
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [length]);

  return trail;
}

/**
 * Ripple effect on click
 */
export function useRipple() {
  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  return { createRipple };
}

/**
 * Smooth scroll to element
 */
export function useSmoothScroll() {
  const scrollTo = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return { scrollTo };
}

/**
 * Intersection observer for lazy loading
 */
export function useLazyLoad(threshold: number = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const isVisible = useMotionValue(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.set(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return { ref, isVisible };
}
