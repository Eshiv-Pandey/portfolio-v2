"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ProfileFlipImage {
  src: string;
  alt: string;
}

interface ProfileFlipProps {
  /** Two faces of the flip card. The first is the front (shown at rest). */
  images: [ProfileFlipImage, ProfileFlipImage];
  sizes?: string;
  /** How long each face is held before flipping, in ms. */
  intervalMs?: number;
}

/**
 * A two-sided card that flips on its Y axis every `intervalMs` to swap between
 * two photos. Meant to be dropped inside <JaaliFrame>, which supplies the
 * marigold plate, the inset, and the rounded clip — this component only owns
 * the 3D flip between the two faces.
 *
 * Rotation accumulates (0 → 180 → 360 …) rather than toggling 0/180, so every
 * flip turns the same way instead of rocking back and forth. With two faces the
 * visible photo alternates on each half-turn, so a continuous forward spin is
 * all that's needed.
 *
 * Under `prefers-reduced-motion` it never flips: the front photo is shown and
 * left alone, matching the rest of the site's single motion off-switch.
 */
export function ProfileFlip({
  images,
  sizes = "96px",
  intervalMs = 5000,
}: ProfileFlipProps) {
  const reduced = useReducedMotion();
  const [halfTurns, setHalfTurns] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setHalfTurns((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [reduced, intervalMs]);

  const [front, back] = images;

  return (
    // The perspective wrapper opens a fresh 3D context inside the frame's
    // (overflow-hidden) inset, so clipping the corner doesn't flatten the flip.
    <div className="absolute inset-0" style={{ perspective: "600px" }}>
      <div
        className="relative h-full w-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${halfTurns * 180}deg)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Image
            src={front.src}
            alt={front.alt}
            fill
            sizes={sizes}
            quality={90}
            preload
            fetchPriority="high"
            className="object-cover object-center"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src={back.src}
            alt={back.alt}
            fill
            sizes={sizes}
            quality={90}
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
