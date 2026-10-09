"use client";

import React, { useMemo, useState } from "react";

import {
  buildWeeks,
  formatDay,
  monthTicks,
  type HeatmapDay,
} from "@/lib/heatmap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * The calendar grid shared by the GitHub and LeetCode heatmaps.
 *
 * Both graphs are the same object with a different colour ramp and a
 * different noun, so they're one component rather than two near-identical
 * files — which also guarantees they stay visually matched as a pair.
 */

export type Ramp = "gh" | "lc";

interface TooltipState {
  count: number;
  date: string;
  x: number;
  y: number;
}

interface ContributionGridProps {
  days: HeatmapDay[];
  /** CSS variable prefix: `gh` reads marigold, `lc` reads teal. */
  ramp: Ramp;
  /** Singular/plural noun for the tooltip, e.g. "contribution". */
  unit: string;
  loading?: boolean;
  /** Accessible description of the whole grid. */
  label: string;
}

const WEEKS = 53;
const DAYS_PER_WEEK = 7;

/** Diagonal sweep — the wave crosses the full grid in just over half a second. */
const CASCADE_STEP_MS = 9;

function levelColor(ramp: Ramp, level: number): string {
  return `var(--${ramp}-${level})`;
}

export function ContributionGrid({
  days,
  ramp,
  unit,
  loading = false,
  label,
}: ContributionGridProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const reducedMotion = useReducedMotion();

  const weeks = useMemo(() => buildWeeks(days), [days]);
  const ticks = useMemo(() => monthTicks(weeks), [weeks]);

  const showTooltip = (
    day: HeatmapDay,
    event: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      count: day.count,
      date: formatDay(day.date),
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  if (loading || weeks.length === 0) {
    return (
      <div className="w-full" aria-busy="true" aria-label={label}>
        <div className="mb-2 h-[10px]" />
        <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-x-[2px]">
          {Array.from({ length: WEEKS }).map((_, column) => (
            <div key={column} className="flex flex-col gap-[2px]">
              {Array.from({ length: DAYS_PER_WEEK }).map((__, row) => (
                <div
                  key={row}
                  className="desi-shimmer aspect-square w-full rounded-[2px]"
                  style={{ backgroundColor: levelColor(ramp, 0) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Month ticks, positioned over the column each month actually starts on */}
      <div className="relative mb-2 h-[12px] text-[10px] text-zinc-400 dark:text-zinc-500">
        {ticks.map((tick) => (
          <span
            key={`${tick.label}-${tick.column}`}
            className="absolute top-0"
            style={{ left: `${(tick.column / weeks.length) * 100}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      <div
        className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-x-[2px]"
        role="img"
        aria-label={label}
      >
        {weeks.map((week, column) => (
          <div key={column} className="flex flex-col gap-[2px]">
            {week.map((day, row) =>
              day === null ? (
                <div
                  key={`pad-${column}-${row}`}
                  className="aspect-square w-full rounded-[2px] bg-transparent"
                />
              ) : (
                <div
                  key={day.date}
                  title={`${day.count} ${unit}${day.count === 1 ? "" : "s"} on ${formatDay(day.date)}`}
                  className={`aspect-square w-full rounded-[2px] outline-none transition-transform duration-150 hover:scale-[1.35] ${
                    reducedMotion ? "" : "heat-cell-in"
                  }`}
                  style={
                    {
                      backgroundColor: levelColor(ramp, day.level),
                      "--cell-delay": `${(column + row) * CASCADE_STEP_MS}ms`,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(event) => showTooltip(day, event)}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Less</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              aria-hidden="true"
              className="size-2 rounded-[2px]"
              style={{ backgroundColor: levelColor(ramp, level) }}
            />
          ))}
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 shadow-lg shadow-zinc-950/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:shadow-black/40"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.count} {unit}
          {tooltip.count === 1 ? "" : "s"} on {tooltip.date}
        </div>
      )}
    </div>
  );
}
