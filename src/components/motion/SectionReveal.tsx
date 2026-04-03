import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

const SectionReveal = ({ children, className, delay = 0, ...props }: SectionRevealProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
