import type { Transition, Variants } from "framer-motion";

export const motionTiming = {
  card: 0.38,
  chart: 0.76,
  page: 0.32,
  stagger: 0.055,
} as const;

export const motionEase = {
  interface: [0.23, 1, 0.32, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 9, filter: "blur(2px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const pageTransition: Transition = {
  duration: motionTiming.page,
  ease: motionEase.interface,
};
