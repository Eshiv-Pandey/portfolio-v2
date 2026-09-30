"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface MagneticProps {
  children: ReactNode;
  /** How far outside the element the pull starts, in px. */
  radius?: number;
  /** Fraction of the cursor's offset the element travels at the very centre.
   *  Above ~0.4 it stops feeling like a button and starts feeling like a bug. */
  strength?: number;
  className?: string;
}

/**
 * Pulls its child toward the cursor as the cursor approaches.
 *
 * The listener is on `window`, not on the element. The whole point is to react
 * *before* the pointer arrives, and an `onPointerEnter` would only fire once
 * the attraction was already over. Padding out the hit box would work too, but
 * a 60px catch area around each button overlaps its neighbours and starts
 * swallowing their clicks — the window listener costs nothing in layout.
 *
 * Under `prefers-reduced-motion` no listener is attached at all.
 */
export function Magnetic({
  children,
  radius = 70,
  strength = 0.3,
  className = "",
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (reduced) return;

    // Coarse pointers have no hover state to anticipate — the finger is either
    // on the button or nowhere near it, so the effect is pure overhead.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;

      // The element is only ever transformed, never re-laid-out, so reading
      // its box here doesn't force a reflow.
      const box = node.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);

      // Distance to the element's edge, not its centre, so wide buttons don't
      // need a wider radius than tall ones to feel the same.
      const reachX = Math.max(0, Math.abs(dx) - box.width / 2);
      const reachY = Math.max(0, Math.abs(dy) - box.height / 2);

      if (Math.hypot(reachX, reachY) > radius) {
        x.set(0);
        y.set(0);
        return;
      }

      x.set(dx * strength);
      y.set(dy * strength);
    };

    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, radius, strength, x, y]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ x: springX, y: springY }}>
      {children}
    </motion.div>
  );
}
