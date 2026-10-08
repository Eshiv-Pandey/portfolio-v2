"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The page-transition curtain: the painted wall from `opening_window.png`,
 * split down the window's own mullion into two shutters that swing open.
 *
 * It runs on first load *and* on every route change. Neither of the obvious
 * mechanisms covers both — a `template.tsx` only remounts for its own segment
 * level, so `/projects` → `/projects/[slug]` slips straight past it, and Next's
 * view-transitions guide states that initial page loads produce no animation.
 * A pathname-driven overlay in the root layout catches first mount and every
 * navigation depth alike, and needs no experimental flag.
 *
 * The overlay is server-rendered *closed*, so it covers the page from the very
 * first paint instead of flashing content and then hiding it. Opening is a pure
 * CSS animation with `forwards` fill (see `.ow-shell` in globals.css), so the
 * doors open and stay open even if JS never arrives. This component's only jobs
 * are to tidy the overlay away afterwards and to replay it on navigation.
 *
 * Because `usePathname()` excludes the hash, the in-page `#experience`-style
 * anchors correctly do not trigger it.
 */

/** Must match `--ow-duration` in globals.css. */
const DURATION_MS = 2100;

/** Slack so the unmount can never clip the last frame of the swing. */
const SETTLE_MS = 120;

export function OpeningWindow() {
  const pathname = usePathname();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setCleared(false);
    const id = window.setTimeout(() => setCleared(true), DURATION_MS + SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (cleared) return null;

  return (
    // `key` earns its place only when a navigation lands mid-run: the element
    // is still mounted then, and a changed key is what forces the fresh node
    // the CSS animations need in order to restart from the top.
    <div key={pathname} className="ow-shell" aria-hidden="true">
      <div className="ow-door ow-door-l">
        <span className="ow-valance" />
        <span className="ow-motif" />
      </div>
      <div className="ow-door ow-door-r">
        <span className="ow-valance" />
        <span className="ow-motif" />
      </div>
      {/* Drawn over both doors, so it reads as light in the joint rather than
          as a painted line on one of them. */}
      <span className="ow-seam" />
    </div>
  );
}
