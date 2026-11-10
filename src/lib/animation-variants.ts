import { Variants } from "framer-motion";

/**
 * Stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Fade in from bottom
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Fade in from top
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Scale pop animation
 */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

/**
 * Rotate and fade
 */
export const rotateFade: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  show: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * Blur to focus
 */
export const blurFocus: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

/**
 * Slide and fade
 */
export const slideAndFade: Variants = {
  hidden: { opacity: 0, x: -100, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Flip in animation
 */
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  show: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * Expand from center
 */
export const expandCenter: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

/**
 * Bounce in
 */
export const bounceIn: Variants = {
  hidden: { opacity: 0, y: -100 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100,
    },
  },
};

/**
 * Elastic scale
 */
export const elasticScale: Variants = {
  hidden: { scale: 0 },
  show: {
    scale: 1,
    transition: {
      type: "spring",
      damping: 8,
      stiffness: 200,
    },
  },
};

/**
 * Shimmer effect
 */
export const shimmer: Variants = {
  hidden: { backgroundPosition: "-200% 0" },
  show: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * Pulse animation
 */
export const pulse: Variants = {
  hidden: { scale: 1 },
  show: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Glow effect
 */
export const glow: Variants = {
  hidden: { boxShadow: "0 0 0px rgba(233, 93, 44, 0)" },
  show: {
    boxShadow: [
      "0 0 0px rgba(233, 93, 44, 0)",
      "0 0 20px rgba(233, 93, 44, 0.6)",
      "0 0 0px rgba(233, 93, 44, 0)",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Typewriter effect
 */
export const typewriter = {
  hidden: { width: 0 },
  show: {
    width: "100%",
    transition: {
      duration: 2,
      ease: "linear",
    },
  },
};

/**
 * Curtain wipe
 */
export const curtainWipe: Variants = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  show: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Liquid fill
 */
export const liquidFill: Variants = {
  hidden: { scaleY: 0, transformOrigin: "bottom" },
  show: {
    scaleY: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Morph shape
 */
export const morphShape: Variants = {
  hidden: { borderRadius: "50%" },
  show: {
    borderRadius: "0%",
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

/**
 * Particle burst
 */
export const particleBurst: Variants = {
  hidden: { scale: 0, opacity: 1 },
  show: {
    scale: [0, 1.5, 0],
    opacity: [1, 0.5, 0],
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

/**
 * Wave animation
 */
export const wave: Variants = {
  hidden: { y: 0 },
  show: {
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Skeleton loading
 */
export const skeletonShimmer: Variants = {
  hidden: { opacity: 0.3 },
  show: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Card lift on hover
 */
export const cardLift = {
  rest: { y: 0, scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * Image zoom on hover
 */
export const imageZoom = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Button press
 */
export const buttonPress = {
  rest: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Accordion expand
 */
export const accordionExpand: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.4,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
      opacity: {
        duration: 0.3,
        delay: 0.1,
      },
    },
  },
};

/**
 * Modal slide up
 */
export const modalSlideUp: Variants = {
  hidden: { y: "100%", opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

/**
 * Dropdown menu
 */
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};
