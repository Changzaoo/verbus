import type { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 22 } },
};

export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', stiffness: 260, damping: 28 } },
  exit: { y: '100%', transition: { duration: 0.2 } },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const exerciseTransition: Variants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { duration: 0.25 } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.2 } },
};

export const shake = {
  x: [0, -8, 8, -6, 6, 0],
  transition: { duration: 0.4 },
};
