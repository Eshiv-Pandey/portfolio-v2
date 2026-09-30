"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface CountUpProps {
  value: number;
  /** Rendered after the number, inside the same element (e.g. "+", "%"). */
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

/** Fast start, long settle — the number lands rather than stopping dead. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Ticks a number up the first time it scrolls into view.
 *
 * Renders the final value immediately when motion is reduced, and uses
 * `tabular-nums` so the surrounding layout doesn't jitter as digits change
 * width mid-count.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  durationMs = 1100,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        setDisplay(Math.round(easeOutExpo(progress) * value));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasRun.current) continue;
          hasRun.current = true;
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, reducedMotion]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
