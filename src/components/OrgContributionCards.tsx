"use client";

import Image from "next/image";

import { useCachedJson } from "@/hooks/use-cached-json";
import type { PullRequestSummary } from "@/lib/pull-requests";

/**
 * The open-source organisations Eshiv contributes to, drawn as one cohesive
 * ledger rather than a row of identical trading cards: a single panel whose
 * rows share a frame and are told apart by an accent spine, the org logo and
 * a compact, right-aligned stat cluster.
 *
 * Every number is computed live from the same `/api/pull-requests` payload the
 * Open Source list uses (author:Eshiv-Pandey against the public GitHub search
 * API), so the cards can never drift from reality.
 */

type OrgKey = "project-hami" | "webpack" | "sugarlabs";

interface OrgMeta {
  owner: OrgKey;
  name: string;
  logo: string;
  /** Role / relationship to the project. */
  status: string;
  /** One-line description under the title. */
  blurb: string;
  /** Small category label. */
  tag: string;
  /** Accent used for the spine, pills and rules. */
  accent: string;
  /** Author-filtered PRs page for this org. */
  link: string;
}

const ORGS: OrgMeta[] = [
  {
    owner: "project-hami",
    name: "HAMi",
    logo: "/images/hami.png",
    status: "Project Member",
    blurb: "CNCF Sandbox · GPU sharing for Kubernetes",
    tag: "Cloud Native",
    accent: "var(--desi-teal)",
    link: "https://github.com/Project-HAMi/HAMi/pulls?q=is%3Apr+author%3AEshiv-Pandey",
  },
  {
    owner: "webpack",
    name: "webpack",
    logo: "/images/webpack.png",
    status: "Contributor",
    blurb: "The module bundler for the web",
    tag: "Build Tools",
    accent: "var(--desi-marigold)",
    link: "https://github.com/webpack/webpack/pulls?q=is%3Apr+author%3AEshiv-Pandey",
  },
  {
    owner: "sugarlabs",
    name: "Sugar Labs",
    logo: "/images/sugarlabs.png",
    status: "Contributor",
    blurb: "Music Blocks · learning through code",
    tag: "Education",
    accent: "var(--desi-rose)",
    link: "https://github.com/sugarlabs/musicblocks/pulls?q=is%3Apr+author%3AEshiv-Pandey",
  },
];

interface OrgStats {
  merged: number;
  closed: number;
  open: number;
  total: number;
  repos: number;
  sinceYear: number | null;
}

/** Fold the shared PR summary down to one org's counts. */
function statsFor(
  owner: OrgKey,
  summary: PullRequestSummary | null
): OrgStats | null {
  if (!summary) return null;
  const mine = ([...summary.buckets.merged, ...summary.buckets.open, ...summary.buckets.closed]).filter(
    (pr) => pr.repo.split("/")[0]?.toLowerCase() === owner
  );
  const merged = mine.filter((pr) => pr.state === "merged").length;
  const open = mine.filter((pr) => pr.state === "open").length;
  const closed = mine.filter((pr) => pr.state === "closed").length;
  const repos = new Set(mine.map((pr) => pr.repo)).size;
  const years = mine.map((pr) => new Date(pr.createdAt).getFullYear());
  return {
    merged,
    open,
    closed,
    total: mine.length,
    repos,
    sinceYear: years.length ? Math.min(...years) : null,
  };
}

/** One labelled figure in the right-hand stat cluster. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[46px] text-right">
      <p className="text-[16px] leading-none font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-1 text-[9.5px] font-medium tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function OrgRow({
  org,
  stats,
  isLast,
}: {
  org: OrgMeta;
  stats: OrgStats | null;
  isLast: boolean;
}) {
  const loading = stats === null;
  const dash = loading ? "·" : undefined;

  return (
    <a
      href={org.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 sm:px-5 dark:hover:bg-white/[0.03]"
    >
      {/* Accent spine — the one thing that tells the rows apart at a glance. */}
      <span
        aria-hidden="true"
        className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full opacity-70 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: org.accent }}
      />

      {/* Logo on a light chip so transparent/dark marks read in dark mode. */}
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10">
        <Image
          src={org.logo}
          alt={org.name}
          width={44}
          height={44}
          className="size-[68%] object-contain"
        />
      </span>

      {/* Name, tag and blurb. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] leading-tight font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {org.name}
          </h3>
          <span
            className="hidden shrink-0 rounded-full px-2 py-[1px] text-[9.5px] font-semibold tracking-wide sm:inline-block"
            style={{
              backgroundColor: `color-mix(in srgb, ${org.accent} 16%, transparent)`,
              color: `color-mix(in srgb, ${org.accent} 62%, #000)`,
            }}
          >
            {org.tag}
          </span>
        </div>
        <p className="mt-1 truncate text-[12px] text-zinc-500 dark:text-zinc-400">
          {org.status} · {org.blurb}
          {stats?.sinceYear ? ` · since ${stats.sinceYear}` : ""}
        </p>
      </div>

      {/* Live stat cluster — merged, total, repos. */}
      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        <Stat value={dash ?? String(stats!.merged)} label="Merged" />
        <div className="hidden h-8 w-px bg-black/10 sm:block dark:bg-white/10" />
        <Stat value={dash ?? String(stats!.total)} label="PRs" />
        <div className="hidden h-8 w-px bg-black/10 md:block dark:bg-white/10" />
        <div className="hidden md:block">
          <Stat value={dash ?? String(stats!.repos)} label="Repos" />
        </div>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="ml-1 hidden size-4 shrink-0 text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-500 sm:block dark:text-zinc-600 dark:group-hover:text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </div>

      {/* Row divider — dashed, in the house style, dropped on the last row. */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-0 h-0 border-b border-black/15 sm:inset-x-5 dark:border-white/10"
          style={{
            maskImage:
              "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
          }}
        />
      )}
    </a>
  );
}

/**
 * The contribution ledger for the Activity section. Fetches once (shared cache
 * key with the Open Source list) and renders one row per organisation inside a
 * single framed panel.
 */
export function OrgContributionCards() {
  const { data } = useCachedJson<PullRequestSummary>(
    "/api/pull-requests",
    "github_prs",
    "v3"
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_1px_2px_rgba(2,6,23,0.05)] dark:border-white/10 dark:bg-[#0c0c0e]">
      {ORGS.map((org, i) => (
        <OrgRow
          key={org.owner}
          org={org}
          stats={statsFor(org.owner, data)}
          isLast={i === ORGS.length - 1}
        />
      ))}
    </div>
  );
}
