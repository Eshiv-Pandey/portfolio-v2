import { DashedRule } from "@/components/desi/section";

/**
 * A woven band at a section seam — the main place the desi palette is allowed
 * onto the page at full strength.
 *
 * The two source assets are mirror-tiled (band + its own horizontal flip), so
 * `repeat-x` loops with no seam and the drift animation can run forever. The
 * animation moves `background-position` by exactly one tile width, which is why
 * the tile size is computed here rather than left to `auto`.
 */

const BANDS = {
  /** ref1 — scalloped jaali medallions with daisy motifs. */
  jaali: { src: "/images/desi-band-jaali.webp", aspect: 736 / 90 },
  /** ref2 — the geometric tile grid. One tile row, mirrored; see
   *  `scripts/make-desi-bands.mjs` for why the row count matters. */
  tile: { src: "/images/desi-band-tile.webp", aspect: 2400 / 120 },
} as const;

export type DesiPattern = keyof typeof BANDS;

interface DesiDividerProps {
  pattern?: DesiPattern;
  /** Band height in px. Tile width follows from the asset's aspect ratio. */
  height?: number;
  /** Drift the other way — alternate between seams so it doesn't read as a loop. */
  reverse?: boolean;
  /** Frame the band with the blueprint hairlines above and below. */
  framed?: boolean;
  className?: string;
}

export function DesiDivider({
  pattern = "jaali",
  height = 26,
  reverse = false,
  framed = true,
  className = "",
}: DesiDividerProps) {
  const { src, aspect } = BANDS[pattern];
  const tile = Math.round(height * aspect);

  return (
    <div
      className={`relative -mx-4 w-[calc(100%+32px)] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {framed && <DashedRule position="top" nodes="edge" />}

      <div
        className={`h-full w-full opacity-55 dark:opacity-40 ${
          reverse ? "jaali-drift-reverse" : "jaali-drift"
        }`}
        style={
          {
            "--jaali-tile": `${tile}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: `${tile}px 100%`,
            // Fades into the page instead of butting against the gutters.
            maskImage:
              "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          } as React.CSSProperties
        }
      />

      {framed && <DashedRule position="bottom" nodes="edge" />}
    </div>
  );
}
