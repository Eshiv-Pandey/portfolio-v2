"use client";

import { ContributionGrid } from "@/components/ContributionGrid";
import { useCachedJson } from "@/hooks/use-cached-json";
import type { HeatmapDay } from "@/lib/heatmap";

export interface LeetCodeProfilePayload {
  username: string;
  ranking: number | null;
  solved: { all: number; easy: number; medium: number; hard: number };
  totalQuestions: { all: number; easy: number; medium: number; hard: number };
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  submissions: number;
  days: HeatmapDay[];
}

export function useLeetCodeProfile() {
  return useCachedJson<LeetCodeProfilePayload>(
    "/api/leetcode",
    "leetcode_profile",
    "v1"
  );
}

interface LeetCodeGraphProps {
  profile: LeetCodeProfilePayload | null;
  loading: boolean;
  error: string | null;
}

/**
 * LeetCode submission calendar — the mirror of <GithubGraph>, sharing its grid
 * so the two read as a matched pair.
 *
 * Takes its data as props rather than fetching, because <ActivityHeatmaps>
 * also needs the profile for the stat strip and one request should serve both.
 */
export function LeetCodeGraph({ profile, loading, error }: LeetCodeGraphProps) {
  const days = profile?.days ?? [];

  const status = error
    ? "LeetCode activity unavailable"
    : loading
      ? "Loading LeetCode activity…"
      : `${profile?.submissions.toLocaleString() ?? 0} submissions in the last year`;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          LeetCode
          <span className="ml-2 font-normal text-zinc-400 dark:text-zinc-500">
            @Eshiv_Pandey
          </span>
        </h3>
        <p
          className="text-right text-[11px] text-zinc-500 dark:text-zinc-400"
          aria-live="polite"
        >
          {status}
        </p>
      </div>

      <ContributionGrid
        days={days}
        ramp="lc"
        unit="submission"
        loading={loading && days.length === 0}
        label={`Calendar heatmap of daily LeetCode submissions over the last year. ${status}`}
      />
    </div>
  );
}
