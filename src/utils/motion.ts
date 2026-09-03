import type { Transition, Variants } from 'framer-motion';

// Standardized easing curves
export const EASINGS = {
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeInOutExpo: [0.87, 0, 0.13, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
};

// Reusable motion transition tokens
export const MOTION_TOKENS = {
  fast: {
    duration: 0.2,
    ease: EASINGS.easeOutExpo,
  } as Transition,

  medium: {
    duration: 0.4,
    ease: EASINGS.easeOutExpo,
  } as Transition,

  slow: {
    duration: 0.7,
    ease: EASINGS.easeOutExpo,
  } as Transition,

  spring: {
    type: 'spring' as const,
    damping: 24,
    stiffness: 260,
    mass: 0.6,
  } as Transition,

  springGentle: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 160,
    mass: 0.5,
  } as Transition,
};

// Reusable viewport reveal variants
export const FADE_UP_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION_TOKENS.medium,
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
