"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion: reduce`, tracked live.
 *
 * globals.css already disables every CSS animation under this query. This
 * hook is the JavaScript half of the same switch — GSAP timelines, canvas
 * loops and Framer Motion variants can't be reached by a media query, so they
 * read it here instead.
 *
 * Returns `false` during SSR and the first client paint. That's deliberate:
 * the server has no way to know the preference, so components should treat a
 * `true` as "stop animating" rather than baking the initial value into markup
 * that would then mismatch.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
