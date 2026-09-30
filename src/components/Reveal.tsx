"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface RevealProps {
  children: ReactNode;
  /** Seconds. Stagger siblings by hand rather than nesting containers. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  className?: string;
}

/**
 * Blur-and-lift entrance the first time an element scrolls into view.
 *
 * Matches the entrance the template already uses on `/pull-requests`, so the
 * new sections move the same way as the pages that shipped with it.
 */
export function Reveal({ children, delay = 0, y = 12, className }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
