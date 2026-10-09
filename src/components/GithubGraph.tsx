"use client";

import { ContributionGrid } from "@/components/ContributionGrid";
import { useCachedJson } from "@/hooks/use-cached-json";
import type { HeatmapDay } from "@/lib/heatmap";

interface ContributionSummary {
  total: number;
  days: HeatmapDay[];
  source: "public" | "graphql";
}

/**
 * GitHub contribution calendar.
 *
 * The template posted a hardcoded GraphQL query to `/api/github`, which
 * returned 401 without a `GITHUB_TOKEN` and left this graph permanently
 * empty on a fresh deploy. `/api/contributions` reads the public calendar
 * instead, so it works with no secrets configured.
 */
export function GithubGraph() {
  const { data, loading, error } = useCachedJson<ContributionSummary>(
    "/api/contributions",
    "github_contributions",
    "v3"
  );

  const total = data?.total ?? 0;
  const days = data?.days ?? [];

  const status = error
    ? "GitHub activity unavailable"
    : loading
      ? "Loading GitHub activity…"
      : `${total.toLocaleString()} contributions in the last year`;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          GitHub
          <span className="ml-2 font-normal text-zinc-400 dark:text-zinc-500">
            @Eshiv-Pandey
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
        ramp="gh"
        unit="contribution"
        loading={loading && days.length === 0}
        label={`Calendar heatmap of daily GitHub contributions over the last year. ${status}`}
      />
    </div>
  );
}
