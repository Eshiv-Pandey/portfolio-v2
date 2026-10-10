"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * The pixel-art web-slinger that hangs in the hero banner.
 *
 * `ref6-sprite.png` is self-contained: the figure sits at the bottom of the
 * frame with its web already drawn running up to the top edge, exiting at
 * x = 105 of 118. Rotating the whole sprite about that exit point is what
 * turns it into a pendulum instead of a spinning cutout — anywhere else as
 * the origin and the web detaches from its anchor.
 */

const SPRITE_WIDTH = 118;
const SPRITE_HEIGHT = 293;

/** Where the web leaves the top edge of the sprite, as a fraction of its width. */
const ANCHOR_X = 105 / SPRITE_WIDTH;

interface SpiderSwingProps {
  /** The banner element, used to drive the scroll response. */
  scrollTarget: RefObject<HTMLElement | null>;
}

export function SpiderSwing({ scrollTarget }: SpiderSwingProps) {
  const reducedMotion = useReducedMotion();

  // 0 while the banner is fully in view, 1 once it has scrolled past the top.
  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end start"],
  });

  // He drifts across and drops as the hero leaves, as though carried by the
  // swing rather than pinned to the page.
  const driftX = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const driftY = useTransform(scrollYProgress, [0, 1], [0, 46]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  const anchorOrigin = `calc(var(--sprite-w) * ${ANCHOR_X}) 0px`;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-[18%] z-[4] sm:left-[24%]"
      style={
        reducedMotion
          ? undefined
          : { x: driftX, y: driftY, opacity: fade }
      }
    >
      <div
        className={reducedMotion ? "" : "spider-swing"}
        style={
          {
            "--sprite-w": "clamp(38px, 5.2vw, 62px)",
            transformOrigin: anchorOrigin,
          } as React.CSSProperties
        }
      >
        {/* Extends the sprite's own web up to the anchor so it reads as
            attached to something above the banner, not floating. */}
        <div
          className="absolute top-0 w-[2px] bg-white/80 dark:bg-white/50"
          style={{
            left: `calc(var(--sprite-w) * ${ANCHOR_X} - 1px)`,
            height: "var(--web-extend, 26px)",
          }}
        />

        <Image
          src="/images/ref6-sprite.png"
          alt=""
          width={SPRITE_WIDTH}
          height={SPRITE_HEIGHT}
          quality={100}
          className="pixelated block h-auto"
          style={{
            width: "var(--sprite-w)",
            marginTop: "var(--web-extend, 26px)",
          }}
        />
      </div>
    </motion.div>
  );
}
