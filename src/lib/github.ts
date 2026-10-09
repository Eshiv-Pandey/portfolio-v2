import {
  buildWindow,
  isoDate,
  levelFrom,
  todayUTC,
  type HeatmapDay,
  type HeatmapLevel,
  type LevelThresholds,
} from "./heatmap";

export const GITHUB_USERNAME = "Eshiv-Pandey";

/** One hour. Contribution counts move slowly; this is plenty fresh. */
export const CONTRIBUTIONS_REVALIDATE = 3600;

/**
 * GitHub's own graph buckets by quartile of the user's busiest day. These
 * thresholds approximate that for the GraphQL fallback path, which is the only
 * path that doesn't hand back pre-computed levels.
 */
const GITHUB_THRESHOLDS: LevelThresholds = [3, 6, 9, Infinity];

export interface ContributionSummary {
  total: number;
  days: HeatmapDay[];
  /** Which upstream answered. Surfaced in the API response for debugging. */
  source: "public" | "graphql";
}

/* ------------------------------------------------------------------ *
 * Primary source: no authentication required.
 *
 * jogruber's API scrapes the same public contribution calendar that renders
 * on github.com/<user>, and returns levels already bucketed. Using it as the
 * primary means the site deploys with zero secrets — a GITHUB_TOKEN becomes
 * an optional upgrade rather than a hard requirement the way the template
 * had it.
 * ------------------------------------------------------------------ */

interface JogruberResponse {
  total: Record<string, number>;
  contributions: { date: string; count: number; level: number }[];
}

async function fetchPublicContributions(
  username: string
): Promise<ContributionSummary> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: CONTRIBUTIONS_REVALIDATE },
    }
  );

  if (!response.ok) {
    throw new Error(`Contributions API responded ${response.status}`);
  }

  const payload = (await response.json()) as JogruberResponse;
  if (!Array.isArray(payload.contributions)) {
    throw new Error("Contributions API returned an unexpected shape");
  }

  // `?y=last` is a rolling 365-day window, so the array is already the window
  // we want — no need to rebuild it, just clamp the level into our union.
  const days: HeatmapDay[] = payload.contributions.map((day) => ({
    date: day.date,
    count: day.count,
    level: Math.min(4, Math.max(0, day.level)) as HeatmapLevel,
  }));

  const total =
    payload.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0);

  return { total, days, source: "public" };
}

/* ------------------------------------------------------------------ *
 * Fallback source: GitHub GraphQL, only reachable with a token.
 * ------------------------------------------------------------------ */

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
        };
      };
    };
  };
  errors?: { message: string }[];
}

async function fetchTokenContributions(
  username: string,
  token: string
): Promise<ContributionSummary> {
  const end = todayUTC();
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 1);

  const query = `
    query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        login: username,
        from: `${isoDate(start)}T00:00:00Z`,
        to: `${isoDate(end)}T23:59:59Z`,
      },
    }),
    next: { revalidate: CONTRIBUTIONS_REVALIDATE },
  });

  const payload = (await response.json()) as GraphQLResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const calendar =
    payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("GraphQL response contained no contribution calendar");
  }

  const counts = new Map<string, number>();
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      counts.set(day.date, day.contributionCount);
    }
  }

  return {
    total: calendar.totalContributions,
    days: buildWindow(counts, GITHUB_THRESHOLDS, { endDate: end }),
    source: "graphql",
  };
}

/**
 * Public contributions first; the token path is a fallback, not a requirement.
 *
 * If both fail the caller gets the error — the graph renders its empty grid
 * rather than blocking the page.
 */
export async function getContributions(
  username: string = GITHUB_USERNAME
): Promise<ContributionSummary> {
  try {
    return await fetchPublicContributions(username);
  } catch (publicError) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw publicError;

    try {
      return await fetchTokenContributions(username, token);
    } catch {
      // Report the primary failure — it's the one that matters for a
      // deployment without a token, which is the expected configuration.
      throw publicError;
    }
  }
}

export { GITHUB_THRESHOLDS, levelFrom };
