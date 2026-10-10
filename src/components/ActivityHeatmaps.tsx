"use client";

import type { ReactNode } from "react";

import { CountUp } from "@/components/CountUp";
import { GithubGraph } from "@/components/GithubGraph";
import { LeetCodeGraph, useLeetCodeProfile } from "@/components/LeetCodeGraph";
import { NebulaBackground } from "@/components/NebulaBackground";
import { OrgContributionCards } from "@/components/OrgContributionCards";
import { Reveal } from "@/components/Reveal";
import { DesiDivider } from "@/components/desi/DesiDivider";
import { SectionHeading } from "@/components/desi/section";

/**
 * The `#activity` section: both heatmaps under one heading, with the LeetCode
 * numbers pulled out above them.
 *
 * The profile request lives here rather than inside <LeetCodeGraph> because the
 * stat strip and the calendar come from the same payload — one fetch, two
 * consumers.
 */

const DIFFICULTY_COLORS = {
  easy: "var(--desi-teal)",
  medium: "var(--desi-marigold)",
  hard: "var(--desi-rose)",
} as const;

/** Accent per stat, so the four cards read as a set rather than a wall of grey. */
const ACCENTS = {
  teal: "var(--desi-teal)",
  marigold: "var(--desi-marigold)",
  rose: "var(--desi-rose)",
  peacock: "#2f6d8c",
} as const;
type Accent = keyof typeof ACCENTS;

interface StatProps {
  label: string;
  value: number | null;
  sub?: string;
  prefix?: string;
  suffix?: string;
  loading: boolean;
  accent: Accent;
  icon: ReactNode;
  /** The streak flame gets a slow heartbeat; nothing else does. */
  pulse?: boolean;
}

function Stat({
  label,
  value,
  sub,
  prefix,
  suffix,
  loading,
  accent,
  icon,
  pulse,
}: StatProps) {
  const color = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-lg border border-black/10 bg-white/45 px-3 py-3 backdrop-blur-[3px] transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/[0.12] dark:bg-white/[0.06]">
      {/* A soft glow in the stat's colour, brightening on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 size-16 rounded-full opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: color }}
      />
      <div className="flex items-center gap-2">
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-[5px] ${pulse ? "streak-pulse" : ""}`}
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
          }}
        >
          {icon}
        </span>
        <p className="text-[10px] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[22px] leading-none font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
        {loading || value === null ? (
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
        ) : (
          <CountUp value={value} prefix={prefix} suffix={suffix} />
        )}
      </p>
      {sub && (
        <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">{sub}</p>
      )}
      <span
        aria-hidden="true"
        className="mt-2.5 block h-[3px] w-8 rounded-full transition-[width] duration-300 group-hover:w-12"
        style={{ background: color }}
      />
    </div>
  );
}

const ICON = {
  solved: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
      <path d="M12 2c1 3-1.5 4.5-2.5 6.5C8 11 9 13 9 13s1-1 1.5-2c.7 1.4 2 2.2 2 4a2.5 2.5 0 0 1-5 .2C7 12 12 10 12 2Zm2.2 8.5c.4 1 1.8 1.7 1.8 3.7a4 4 0 1 1-8 0c0-.4 0-.8.1-1.1.6 3 4.1 3 4.1.4 0-1.7 1.4-2 2-3Z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H3.5v1A3.5 3.5 0 0 0 6 10M18 6h2.5v1a3.5 3.5 0 0 1-2.5 3M9 20h6M12 13v4" />
    </svg>
  ),
} as const;

export function ActivityHeatmaps() {
  const { data: profile, loading, error } = useLeetCodeProfile();

  const solved = profile?.solved;
  const totals = profile?.totalQuestions;
  const solvedAll = solved?.all ?? 0;

  /**
   * The bar shows the split of what's been solved, not progress through
   * LeetCode's ~4,000 problems — a completion bar would read as three slivers
   * and say nothing about which problems he actually works on.
   */
  const split = (
    [
      ["easy", solved?.easy ?? 0],
      ["medium", solved?.medium ?? 0],
      ["hard", solved?.hard ?? 0],
    ] as const
  ).map(([key, count]) => ({
    key,
    count,
    share: solvedAll > 0 ? (count / solvedAll) * 100 : 0,
    total: totals?.[key] ?? 0,
  }));

  return (
    <section
      id="activity"
      className="relative z-10 mt-6 flex scroll-mt-24 flex-col"
    >
      <SectionHeading
        title="Activity"
        devanagari="गतिविधि"
        topRule
        aside="Last 12 months"
      />

      <div className="flex flex-col gap-7 pt-6 pb-2">
        {/* The organisations Eshiv contributes to, as the section's lead —
            card.png-style panels driven by live GitHub numbers. These replace
            the LeetCode stat tiles that used to sit here; those tiles now live
            with the LeetCode calendar below, where their numbers belong. */}
        <Reveal>
          <p className="mb-3 text-[12px] text-zinc-500 dark:text-zinc-400">
            Open-source organisations I contribute to
          </p>
          <OrgContributionCards />
        </Reveal>

        {/* Stacked, GitHub above LeetCode — they read as a matched pair one
            under the other, and a full-width 53-week grid gives each cell more
            room to breathe than the old side-by-side columns did. */}
        <div className="relative flex flex-col gap-7">
          <Reveal delay={0.05}>
            <GithubGraph />
          </Reveal>

          {/* A tile band marks the seam between the two graphs. */}
          <DesiDivider
            pattern="tile"
            height={26}
            reverse
            framed={false}
          />

          <Reveal delay={0.05}>
            {/* The LeetCode numbers sit directly above their own calendar, on
                the same nebula the banner and footer share (a translucent veil
                keeps the figures readable), so the four cards read as a lit
                band rather than plain tiles. */}
            <div className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
              <NebulaBackground />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--fx-card) 42%, transparent)",
                }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-2.5 p-2.5 sm:grid-cols-4">
                <Stat
                  label="Solved"
                  accent="teal"
                  icon={ICON.solved}
                  value={solved?.all ?? null}
                  sub={totals ? `of ${totals.all.toLocaleString()} problems` : undefined}
                  loading={loading}
                />
                <Stat
                  label="Streak"
                  accent="marigold"
                  icon={ICON.flame}
                  pulse
                  value={profile?.streak ?? null}
                  sub="consecutive days"
                  loading={loading}
                />
                <Stat
                  label="Active days"
                  accent="rose"
                  icon={ICON.calendar}
                  value={profile?.totalActiveDays ?? null}
                  sub="this year"
                  loading={loading}
                />
                <Stat
                  label="Global rank"
                  accent="peacock"
                  icon={ICON.trophy}
                  value={profile?.ranking ?? null}
                  prefix="#"
                  sub="on LeetCode"
                  loading={loading}
                />
              </div>
            </div>

            {/* Difficulty split */}
            <div className="mt-3 mb-6">
              <div className="flex h-[6px] w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                {split.map((part) => (
                  <div
                    key={part.key}
                    className="h-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${part.share}%`,
                      backgroundColor: DIFFICULTY_COLORS[part.key],
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {split.map((part) => (
                  <span
                    key={part.key}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-500 capitalize dark:text-zinc-400"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-[2px]"
                      style={{ backgroundColor: DIFFICULTY_COLORS[part.key] }}
                    />
                    {part.key}
                    <span className="font-medium text-zinc-700 tabular-nums dark:text-zinc-200">
                      {part.count}
                    </span>
                    {part.total > 0 && (
                      <span className="text-zinc-400 tabular-nums dark:text-zinc-600">
                        / {part.total.toLocaleString()}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <LeetCodeGraph profile={profile} loading={loading} error={error} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
