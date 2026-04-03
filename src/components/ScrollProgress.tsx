import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-primary via-secondary to-accent"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : scaleX }}
    />
  );
};

export default ScrollProgress;
