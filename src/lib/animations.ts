import type { Variants, Transition } from "framer-motion";

// Timing constants from design-tokens §8
const INSTANT = 0.1;
const FAST = 0.2;
const NORMAL = 0.3;
const SLOW = 0.5;
const CELEBRATION = 0.8;

// Spring presets
const springDefault = { type: "spring" as const, stiffness: 300, damping: 20 };
const springBouncy = { type: "spring" as const, stiffness: 400, damping: 15 };
const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };
const springCelebration = { type: "spring" as const, stiffness: 80, damping: 10, mass: 1 };

// --- Named Presets ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: NORMAL } },
};

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: NORMAL, ease: "easeOut" } },
};

export const slideInRight: Variants = {
  hidden: { x: 30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: FAST, ease: "easeOut" } },
};

export const popIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: springDefault },
};

export const bounceIn: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: [0, 1.1, 1],
    transition: springBouncy,
  },
};

export const progressFill = (target: number): Variants => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: target,
    transition: { duration: SLOW, ease: "easeOut" },
  },
});

export const shake: Variants = {
  hidden: {},
  visible: {
    x: [-4, 4, -4, 4, 0],
    transition: { duration: NORMAL },
  },
};

export const pulse: Variants = {
  hidden: {},
  visible: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.4 },
  },
};

export const glow: Variants = {
  hidden: {},
  visible: {
    boxShadow: [
      "0 0 0px rgba(255,176,32,0)",
      "0 0 20px rgba(255,176,32,0.3)",
      "0 0 0px rgba(255,176,32,0)",
    ],
    transition: { duration: 0.6 },
  },
};

export const slideDown: Variants = {
  hidden: { y: -10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: FAST, ease: "easeOut" } },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: FAST } },
};

export const strikethrough: Variants = {
  hidden: { width: "0%" },
  visible: { width: "100%", transition: { duration: NORMAL, ease: "easeInOut" } },
};

export const float: Variants = {
  hidden: { y: 0, opacity: 1 },
  visible: {
    y: -40,
    opacity: 0,
    transition: { duration: 1.5, ease: "easeOut" },
  },
};

export const wobble: Variants = {
  hidden: {},
  visible: {
    rotate: [-2, 2, -1, 1, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 },
  },
};

export const flame: Variants = {
  hidden: {},
  visible: {
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 0.8, repeat: Infinity },
  },
};

// --- Enhanced gamification presets (S-3-ENHANCED §4) ---

export const coinDrop: Variants = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: [0, -5, 0],
    opacity: 1,
    transition: { ...springBouncy, duration: 0.4 },
  },
};

export const chestBounce: Variants = {
  hidden: { scale: 0, y: 20 },
  visible: {
    scale: [0, 1.2, 1],
    y: 0,
    transition: springBouncy,
  },
};

export const itemReveal: Variants = {
  hidden: { scale: 0, rotate: 0, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 360,
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

export const bossHit: Variants = {
  hidden: {},
  visible: {
    x: [-3, 3, -3, 3, 0],
    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
    transition: { duration: 0.4 },
  },
};

export const petBounce: Variants = {
  hidden: {},
  visible: {
    y: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export const numberRoll: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: FAST } },
};

export const streakFreeze: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.1, 1],
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// --- Stagger container ---

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// --- Page transition ---

export const pageTransition: Transition = {
  type: "tween",
  duration: NORMAL,
  ease: "easeInOut",
};

export const confettiParticle = (index: number): Variants => ({
  hidden: { y: 0, x: 0, opacity: 1, scale: 1 },
  visible: {
    y: [0, -100 - Math.random() * 200, 400],
    x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 300],
    opacity: [1, 1, 0],
    rotate: Math.random() * 720,
    scale: [1, 0.8, 0.4],
    transition: { duration: 1.2 + Math.random() * 0.5, ease: "easeOut" },
  },
});
