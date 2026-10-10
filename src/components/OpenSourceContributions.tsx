"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/desi/section";
import { useCachedJson } from "@/hooks/use-cached-json";
import type {
  PullRequest,
  PullRequestState,
  PullRequestSummary,
} from "@/lib/pull-requests";

/**
 * Pull requests Eshiv has opened against other people's repositories.
 *
 * The template ran a paginated GraphQL query from the browser through a
 * token-gated proxy, which meant an empty list on any deploy without a
 * `GITHUB_TOKEN`. `/api/pull-requests` does the search server-side against the
 * public REST endpoint and returns all three buckets at once, so this is a
 * single unauthenticated GET and the filter tabs switch instantly.
 */

const INITIAL_COUNT = 4;

/** Repo owner → logo. Rows against these orgs get the real mark next to the
 *  state dot; everything else keeps the dot alone. Keyed by the `owner`
 *  segment of `owner/repo` so every repo under an org matches. */
const ORG_LOGO: Record<string, { src: string; alt: string }> = {
  "project-hami": { src: "/images/hami.png", alt: "HAMi" },
  sugarlabs: { src: "/images/sugarlabs.png", alt: "Sugar Labs" },
  webpack: { src: "/images/webpack.png", alt: "webpack" },
};

function orgLogoFor(repo: string) {
  const owner = repo.split("/")[0]?.toLowerCase();
  return owner ? ORG_LOGO[owner] : undefined;
}

const FILTERS: PullRequestState[] = ["merged", "open", "closed"];

/** Matches GitHub's own state colours, so the dots read without a legend. */
const STATE_DOT: Record<PullRequestState, string> = {
  merged: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  open: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  closed: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
};

const PILL_OFFSET: Record<PullRequestState, string> = {
  merged: "translate-x-0",
  open: "translate-x-[100%]",
  closed: "translate-x-[200%]",
};

const DASH_ROW =
  "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)";

function FilterTabs({
  value,
  onChange,
}: {
  value: PullRequestState;
  onChange: (next: PullRequestState) => void;
}) {
  return (
    <div className="group relative z-20 mr-[8px] flex items-center gap-2">
      <div className="pointer-events-none absolute -inset-[5px] rounded-[11px] border border-black/5 transition-colors duration-300 group-hover:border-black/10 dark:border-white/5 dark:group-hover:border-white/10" />
      <div className="relative grid w-fit grid-cols-3 rounded-[6px] border border-black/5 bg-zinc-50 p-1 shadow-sm shadow-black/20 select-none dark:border-white/5 dark:bg-[#09090b] dark:shadow-lg dark:shadow-black/80">
        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] transform rounded-[4px] border border-zinc-200/50 bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform dark:border-zinc-800/50 dark:bg-[#1e1e20] ${PILL_OFFSET[value]}`}
        />
        {FILTERS.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={value === type}
            className={`relative z-10 px-3 py-1.5 text-center text-[12px] font-medium capitalize transition-colors duration-200 ${
              value === type
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function PullRequestRow({ pr, isLast }: { pr: PullRequest; isLast: boolean }) {
  const logo = orgLogoFor(pr.repo);
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative -mx-4 flex flex-col gap-1.5 rounded-lg px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20"
    >
      {!isLast && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-0 border-b border-black/30 dark:border-white/[0.15]"
          style={{ maskImage: DASH_ROW, WebkitMaskImage: DASH_ROW }}
        />
      )}
      <div className="relative z-20 flex min-w-0 items-center gap-2.5">
        {logo ? (
          // The org mark carries the state as a small dot in its corner, so
          // the row still reads merged/open/closed at a glance.
          <span className="relative shrink-0">
            <span className="grid size-6 place-items-center overflow-hidden rounded-[6px] border border-black/10 bg-white shadow-sm shadow-black/10 dark:border-white/15 dark:shadow-black/50">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={24}
                height={24}
                className="size-[78%] object-contain"
              />
            </span>
            <span
              aria-hidden="true"
              className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-white dark:ring-[#0a0a0a] ${STATE_DOT[pr.state]}`}
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${STATE_DOT[pr.state]}`}
          />
        )}
        <h3 className="truncate text-[14px] font-medium text-zinc-800 transition-colors group-hover:text-zinc-900 dark:text-zinc-200 dark:group-hover:text-zinc-100">
          {pr.title}
        </h3>
      </div>
      <p className="relative z-20 ml-4.5 pl-0.5 text-[12px] text-zinc-500 dark:text-zinc-400">
        {pr.repo}
        <span className="ml-2 text-zinc-400 dark:text-zinc-600">#{pr.number}</span>
      </p>
    </a>
  );
}

function RowSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: INITIAL_COUNT }).map((_, index) => (
        <div
          key={index}
          className="relative -mx-4 flex flex-col gap-1.5 px-4 py-4"
        >
          {index < INITIAL_COUNT - 1 && (
            <div
              className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-0 border-b border-black/30 dark:border-white/[0.15]"
              style={{ maskImage: DASH_ROW, WebkitMaskImage: DASH_ROW }}
            />
          )}
          <div className="flex items-center gap-2.5">
            <div className="size-2 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="ml-4.5 pl-0.5">
            <div className="mt-0.5 h-3 w-1/3 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OpenSourceContributions({
  isFullPage = false,
}: {
  isFullPage?: boolean;
}) {
  const { data, loading, error } = useCachedJson<PullRequestSummary>(
    "/api/pull-requests",
    "github_prs",
    "v3"
  );

  const [filter, setFilter] = useState<PullRequestState>("merged");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // All three buckets arrive together, so switching is a local state change —
  // the brief fade is purely so the list doesn't snap.
  const handleFilterChange = useCallback(
    (next: PullRequestState) => {
      if (next === filter) return;
      setIsTransitioning(true);
      setFilter(next);
      requestAnimationFrame(() => setIsTransitioning(false));
    },
    [filter]
  );

  const current = data?.buckets[filter] ?? [];
  const visible = isFullPage ? current : current.slice(0, INITIAL_COUNT);
  const hiddenCount = current.length - visible.length;

  const aside = data
    ? `${data.total} PRs across ${data.repositories.length} repositories`
    : null;

  return (
    <div className="flex w-full flex-col">
      <SectionHeading
        title="Open Source"
        devanagari="मुक्त स्रोत"
        aside={<FilterTabs value={filter} onChange={handleFilterChange} />}
      />

      {aside && (
        <p className="pt-3 text-[12px] text-zinc-500 dark:text-zinc-400">
          {aside}
        </p>
      )}

      <div className="relative pt-1 pb-2">
        <div
          className="transition-all duration-150 ease-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(4px)" : "translateY(0)",
          }}
        >
          {loading && !data ? (
            <RowSkeleton />
          ) : visible.length > 0 ? (
            <div className="flex flex-col">
              {visible.map((pr, index) => (
                <PullRequestRow
                  key={pr.id}
                  pr={pr}
                  isLast={index === visible.length - 1}
                />
              ))}

              {!isFullPage && hiddenCount > 0 && (
                <div className="relative z-20 mt-4 flex justify-center">
                  <Link href="/pull-requests" className="group relative block">
                    <div className="pointer-events-none absolute -inset-[5px] rounded-[11px] border border-black/5 transition-colors duration-300 group-hover:border-black/10 dark:border-white/5 dark:group-hover:border-white/10" />
                    <div className="relative flex items-center gap-1.5 rounded-[6px] border border-black/5 bg-zinc-50 px-4 py-2 text-[13px] font-medium text-zinc-600 shadow-sm shadow-black/20 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/5 dark:bg-[#09090b] dark:text-zinc-400 dark:shadow-lg dark:shadow-black/80 dark:hover:bg-[#121214] dark:hover:text-zinc-100">
                      View All ({hiddenCount} more)
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3.5 -rotate-90 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="py-6 text-center text-[13px] text-zinc-500 dark:text-zinc-400">
              {error
                ? "Couldn't reach GitHub just now. Try again in a minute."
                : `No ${filter} pull requests.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
