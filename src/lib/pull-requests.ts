import { GITHUB_USERNAME } from "./github";

export const PULL_REQUESTS_REVALIDATE = 1800;

/** GitHub's search API caps at 1000 results; 300 is far beyond what we show. */
const MAX_RESULTS = 300;
const PAGE_SIZE = 100;

export type PullRequestState = "merged" | "open" | "closed";

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  /** `owner/repo`. */
  repo: string;
  state: PullRequestState;
  draft: boolean;
  createdAt: string;
  /** Merge, close, or creation date — whichever is the most recent milestone. */
  sortedAt: string;
}

export interface PullRequestSummary {
  total: number;
  repositories: string[];
  buckets: Record<PullRequestState, PullRequest[]>;
}

interface SearchItem {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  state: string;
  draft?: boolean;
  created_at: string;
  closed_at: string | null;
  pull_request?: { merged_at: string | null };
}

interface SearchResponse {
  total_count?: number;
  items?: SearchItem[];
  message?: string;
}

function repoFromUrl(repositoryUrl: string): string {
  return repositoryUrl.replace("https://api.github.com/repos/", "");
}

function stateOf(item: SearchItem): PullRequestState {
  if (item.pull_request?.merged_at) return "merged";
  return item.state === "open" ? "open" : "closed";
}

/**
 * The unauthenticated search endpoint is rate limited to 10 requests/minute
 * per IP. That's why this runs on the server behind a revalidated fetch
 * rather than from the browser: a few upstream calls an hour serve every
 * visitor, instead of each visitor spending their own quota.
 *
 * A GITHUB_TOKEN, when present, raises the limit — but nothing here requires it.
 */
async function searchPullRequests(username: string): Promise<SearchItem[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const items: SearchItem[] = [];

  for (let page = 1; items.length < MAX_RESULTS; page++) {
    const url =
      `https://api.github.com/search/issues` +
      `?q=${encodeURIComponent(`author:${username} type:pr`)}` +
      `&per_page=${PAGE_SIZE}&page=${page}&sort=created&order=desc`;

    const response = await fetch(url, {
      headers,
      next: { revalidate: PULL_REQUESTS_REVALIDATE },
    });

    if (!response.ok) {
      // Page 1 failing is fatal; a later page failing just truncates the list.
      if (page === 1) {
        throw new Error(`GitHub search responded ${response.status}`);
      }
      break;
    }

    const payload = (await response.json()) as SearchResponse;
    const batch = payload.items ?? [];
    items.push(...batch);

    if (batch.length < PAGE_SIZE) break;
  }

  return items.slice(0, MAX_RESULTS);
}

/**
 * Pull requests Eshiv opened against repositories he does not own.
 *
 * Self-PRs to his own repos are real, but they aren't open-source
 * contributions in the sense this section is claiming, so they're excluded by
 * owner rather than by an ad-hoc title blocklist.
 */
export async function getPullRequests(
  username: string = GITHUB_USERNAME
): Promise<PullRequestSummary> {
  const items = await searchPullRequests(username);
  const owner = username.toLowerCase();

  const pullRequests: PullRequest[] = items
    .map((item) => {
      const repo = repoFromUrl(item.repository_url);
      const state = stateOf(item);

      return {
        id: item.id,
        number: item.number,
        title: item.title,
        url: item.html_url,
        repo,
        state,
        draft: Boolean(item.draft),
        createdAt: item.created_at,
        sortedAt:
          item.pull_request?.merged_at ?? item.closed_at ?? item.created_at,
      };
    })
    .filter((pr) => pr.repo.split("/")[0].toLowerCase() !== owner)
    .sort((a, b) => b.sortedAt.localeCompare(a.sortedAt));

  const buckets: Record<PullRequestState, PullRequest[]> = {
    merged: [],
    open: [],
    closed: [],
  };
  for (const pr of pullRequests) buckets[pr.state].push(pr);

  return {
    total: pullRequests.length,
    repositories: Array.from(new Set(pullRequests.map((pr) => pr.repo))).sort(),
    buckets,
  };
}
