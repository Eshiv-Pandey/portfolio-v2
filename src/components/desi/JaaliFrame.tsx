import Image from "next/image";

/**
 * A cusped (multifoil) arch frame — the Mughal mehrab that portraits in Indian
 * miniature painting sit inside.
 *
 * The arch is authored once in objectBoundingBox units and used twice: as the
 * clip on a solid marigold plate, and as the clip on the photo inset 3px inside
 * it. The plate showing through the inset is what draws the frame, so there's
 * no stroke to keep in sync with the shape.
 *
 * The lobes were placed to cut only background: the shallowest point of the
 * arch still clears the top of the head in `Eshiv_Pandey.jpeg`.
 */
const ARCH_PATH = [
  "M 0 1",
  "L 0 0.44",
  "Q 0 0.30 0.13 0.30",
  "Q 0.14 0.14 0.30 0.13",
  "Q 0.32 0.02 0.50 0.02",
  "Q 0.68 0.02 0.70 0.13",
  "Q 0.86 0.14 0.87 0.30",
  "Q 1 0.30 1 0.44",
  "L 1 1",
  "Z",
].join(" ");

interface JaaliFrameProps {
  src: string;
  alt: string;
  /** Sizing lives on the caller so the frame can be reused at any scale. */
  className?: string;
  sizes?: string;
  /** Fetch eagerly — set for the above-the-fold profile photo. */
  preload?: boolean;
  /**
   * SVG ids are document-global, so a second frame on the same page needs its
   * own. Server component, hence a prop rather than `useId()`.
   */
  clipId?: string;
}

export function JaaliFrame({
  src,
  alt,
  className = "",
  sizes = "96px",
  preload = false,
  clipId = "jaali-arch",
}: JaaliFrameProps) {
  const clip = `url(#${clipId})`;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={ARCH_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* The frame itself: a marigold plate the photo is inset into. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ clipPath: clip, backgroundColor: "var(--desi-marigold)" }}
      />

      <div
        className="absolute inset-[3px] bg-zinc-100 dark:bg-zinc-900"
        style={{ clipPath: clip }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={90}
          preload={preload}
          fetchPriority={preload ? "high" : undefined}
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}
