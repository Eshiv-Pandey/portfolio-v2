import {
  buildWindow,
  type HeatmapDay,
  type LevelThresholds,
} from "./heatmap";

export const LEETCODE_USERNAME = "Eshiv_Pandey";

export const LEETCODE_REVALIDATE = 3600;

/**
 * Tuned to the actual submission distribution rather than copied from GitHub:
 * a heavy LeetCode day is roughly a dozen submissions, where a heavy GitHub
 * day is a couple of dozen commits. Using GitHub's ramp here would flatten
 * the whole calendar into level 1.
 */
const LEETCODE_THRESHOLDS: LevelThresholds = [2, 5, 9, Infinity];

export interface LeetCodeProfile {
  username: string;
  /** Global rank. `null` for accounts LeetCode hasn't ranked. */
  ranking: number | null;
  solved: { all: number; easy: number; medium: number; hard: number };
  /** Size of the question bank, for "207 of 4055" style context. */
  totalQuestions: { all: number; easy: number; medium: number; hard: number };
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  /** Submissions across the trailing year — not the same as problems solved. */
  submissions: number;
  days: HeatmapDay[];
}

const PROFILE_QUERY = `
  query PortfolioProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

interface DifficultyCount {
  difficulty: string;
  count: number;
}

interface LeetCodeResponse {
  data?: {
    matchedUser?: {
      username: string;
      profile?: { ranking?: number | null };
      submitStatsGlobal?: { acSubmissionNum: DifficultyCount[] };
      userCalendar?: {
        activeYears: number[];
        streak: number;
        totalActiveDays: number;
        submissionCalendar: string;
      };
    } | null;
    allQuestionsCount?: DifficultyCount[];
  };
  errors?: { message: string }[];
}

function byDifficulty(rows: DifficultyCount[] | undefined) {
  const pick = (difficulty: string) =>
    rows?.find((row) => row.difficulty === difficulty)?.count ?? 0;

  return {
    all: pick("All"),
    easy: pick("Easy"),
    medium: pick("Medium"),
    hard: pick("Hard"),
  };
}

/**
 * `submissionCalendar` arrives as a JSON *string* keyed by unix timestamps at
 * UTC midnight, with zero days omitted. Parse defensively — a malformed
 * calendar should cost us the graph, not the whole stat block.
 */
function parseCalendar(raw: string | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  if (!raw) return counts;

  let parsed: Record<string, number>;
  try {
    parsed = JSON.parse(raw) as Record<string, number>;
  } catch {
    return counts;
  }

  for (const [timestamp, count] of Object.entries(parsed)) {
    const seconds = Number(timestamp);
    if (!Number.isFinite(seconds)) continue;
    const date = new Date(seconds * 1000).toISOString().slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + Number(count || 0));
  }

  return counts;
}

/**
 * LeetCode has no REST API and its GraphQL endpoint rejects browser-origin
 * requests, so this must run server-side — see `app/api/leetcode/route.ts`.
 * No authentication is needed for public profile data.
 */
export async function getLeetCodeProfile(
  username: string = LEETCODE_USERNAME
): Promise<LeetCodeProfile> {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // LeetCode 403s requests without a plausible referer.
      Referer: `https://leetcode.com/u/${username}/`,
      "User-Agent": "Mozilla/5.0 (compatible; eshivpandey.dev portfolio)",
    },
    body: JSON.stringify({
      query: PROFILE_QUERY,
      variables: { username },
    }),
    next: { revalidate: LEETCODE_REVALIDATE },
  });

  if (!response.ok) {
    throw new Error(`LeetCode responded ${response.status}`);
  }

  const payload = (await response.json()) as LeetCodeResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const user = payload.data?.matchedUser;
  if (!user) {
    throw new Error(`LeetCode has no public profile for "${username}"`);
  }

  const counts = parseCalendar(user.userCalendar?.submissionCalendar);
  const days = buildWindow(counts, LEETCODE_THRESHOLDS);

  return {
    username: user.username,
    ranking: user.profile?.ranking ?? null,
    solved: byDifficulty(user.submitStatsGlobal?.acSubmissionNum),
    totalQuestions: byDifficulty(payload.data?.allQuestionsCount),
    streak: user.userCalendar?.streak ?? 0,
    totalActiveDays: user.userCalendar?.totalActiveDays ?? 0,
    activeYears: user.userCalendar?.activeYears ?? [],
    submissions: days.reduce((sum, day) => sum + day.count, 0),
    days,
  };
}

export { LEETCODE_THRESHOLDS };
