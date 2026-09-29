import type { ReactNode } from "react";

/**
 * The blueprint chrome every section on the page is built from.
 *
 * The template inlined this dashed-line-plus-intersection-nodes markup at each
 * seam — a dozen near-identical copies of the same 8 lines. Pulling it into two
 * components keeps the grid consistent and makes the desi accents (the marigold
 * tick, the Devanagari companion) a one-line change rather than a dozen.
 */

/** 1px on, 5px off — the hairline that reads as a drafting guide. */
export const DASH_MASK =
  "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)";

export const DASH_MASK_VERTICAL =
  "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)";

type RulePosition = "top" | "bottom";

/**
 * `gutter` puts the nodes where the page's vertical guides cross the rule,
 * `edge` aligns them to the content box (used inside padded blocks).
 */
type NodePlacement = "gutter" | "edge" | "none";

interface DashedRuleProps {
  position?: RulePosition;
  nodes?: NodePlacement;
  className?: string;
}

/**
 * A full-bleed dashed hairline with the two intersection nodes that mark where
 * it crosses the vertical guides. Renders into the nearest positioned ancestor.
 */
export function DashedRule({
  position = "bottom",
  nodes = "gutter",
  className = "",
}: DashedRuleProps) {
  const isTop = position === "top";
  const edgeClass = isTop ? "top-0" : "bottom-0";
  const borderClass = isTop
    ? "border-t border-black/30 dark:border-white/[0.15]"
    : "border-b border-black/30 dark:border-white/[0.15]";
  const nodeShift = isTop ? "-translate-y-1/2" : "translate-y-1/2";
  const [leftClass, rightClass] =
    nodes === "edge" ? ["left-0", "right-0"] : ["-left-4", "-right-4"];

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute ${edgeClass} right-[-100vw] left-[-100vw] h-0 ${borderClass} ${className}`}
        style={{ maskImage: DASH_MASK, WebkitMaskImage: DASH_MASK }}
      />
      {nodes !== "none" && (
        <>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute ${edgeClass} ${leftClass} z-20 h-[2px] w-[2px] -translate-x-1/2 ${nodeShift} bg-black/50 dark:bg-white/[0.25]`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute ${edgeClass} ${rightClass} z-20 h-[2px] w-[2px] translate-x-1/2 ${nodeShift} bg-black/50 dark:bg-white/[0.25]`}
          />
        </>
      )}
    </>
  );
}

interface SectionHeadingProps {
  title: string;
  /** Devanagari companion (e.g. "अनुभव") — decorative, so hidden from AT. */
  devanagari?: string;
  /** Right-aligned slot: a count, a live status line, a link. */
  aside?: ReactNode;
  /** Also draw the rule above the heading — used where a section starts a run. */
  topRule?: boolean;
  className?: string;
}

/**
 * A section title sitting between two dashed rules, with a marigold tick and a
 * Devanagari companion as the accent. The tick is a rotated square rather than
 * a bullet so it echoes the tile motifs in the dividers.
 */
export function SectionHeading({
  title,
  devanagari,
  aside,
  topRule = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`relative mt-1 py-2 ${className}`}>
      {topRule && <DashedRule position="top" />}

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="flex items-baseline gap-2 text-[18px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          <span
            aria-hidden="true"
            className="size-[5px] shrink-0 translate-y-[-3px] rotate-45 rounded-[1px]"
            style={{ backgroundColor: "var(--desi-marigold)" }}
          />
          {title}
          {devanagari && (
            <span
              aria-hidden="true"
              className="font-devanagari text-[13px] font-normal text-zinc-400 dark:text-zinc-600"
            >
              {devanagari}
            </span>
          )}
        </h2>

        {aside && (
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {aside}
          </div>
        )}
      </div>

      <DashedRule position="bottom" />
    </div>
  );
}
