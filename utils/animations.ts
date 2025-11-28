import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 }
  }
};

export const unfold: Variants = {
  hidden: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

export const widthExpand: Variants = {
  collapsed: { width: 0, opacity: 0 },
  expanded: { width: 220, opacity: 1 }
};