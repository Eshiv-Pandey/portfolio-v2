/**
 * Shared shape for the contribution graphs.
 *
 * GitHub and LeetCode expose wildly different payloads — GitHub hands back
 * pre-bucketed levels, LeetCode a JSON string of unix-timestamp → submission
 * count with the zero days omitted entirely. Both are normalised to the types
 * below before they reach a component, so <GithubGraph> and <LeetCodeGraph>
 * render from identical data and differ only in their colour ramp.
 *
 * Everything here works in UTC. The graphs are a year-at-a-glance device, not
 * a clock, and using the viewer's local timezone would shift cells by a day
 * depending on where the page is opened from.
 */

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  /** Calendar day, `YYYY-MM-DD`. */
  date: string;
  count: number;
  level: HeatmapLevel;
}

/** One Sunday-first column. `null` pads the partial weeks at either end. */
export type HeatmapWeek = (HeatmapDay | null)[];

export interface MonthTick {
  label: string;
  /** Zero-based column the label sits above. */
  column: number;
}

/** Count boundaries for levels 1–4. A count of 0 is always level 0. */
export type LevelThresholds = readonly [number, number, number, number];

export const DAYS_IN_WINDOW = 365;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + delta);
  return next;
}

/** Today at 00:00 UTC. */
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function levelFrom(count: number, thresholds: LevelThresholds): HeatmapLevel {
  if (count <= 0) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  return 4;
}

/**
 * Expand a sparse `date → count` map into a contiguous trailing window.
 *
 * Sources that omit zero days (LeetCode) would otherwise produce a grid with
 * holes in it; this fills them so the calendar is always a solid rectangle.
 */
export function buildWindow(
  counts: Map<string, number>,
  thresholds: LevelThresholds,
  options: { days?: number; endDate?: Date } = {}
): HeatmapDay[] {
  const days = options.days ?? DAYS_IN_WINDOW;
  const end = options.endDate ?? todayUTC();
  const start = addDays(end, -(days - 1));

  const out: HeatmapDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = isoDate(addDays(start, i));
    const count = counts.get(date) ?? 0;
    out.push({ date, count, level: levelFrom(count, thresholds) });
  }
  return out;
}

/**
 * Group days into Sunday-first columns.
 *
 * The first and last weeks are almost never full, so they're padded with
 * `null` — the graph renders those as transparent cells, which is what keeps
 * the top-left and bottom-right corners ragged the way GitHub's own graph is.
 */
export function buildWeeks(days: HeatmapDay[]): HeatmapWeek[] {
  if (days.length === 0) return [];

  const weeks: HeatmapWeek[] = [];
  let current: HeatmapWeek = [];

  // Pad up to the first day's weekday so column 0 still starts on Sunday.
  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstWeekday; i++) current.push(null);

  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  return weeks;
}

/**
 * Month labels positioned over the column where each month actually begins.
 *
 * The template spread twelve fixed names with `justify-between`, which drifts
 * out of alignment with the cells beneath them. Deriving the ticks from the
 * data keeps the label over its own month. Months that own fewer than two
 * columns are dropped so labels never collide.
 */
export function monthTicks(weeks: HeatmapWeek[]): MonthTick[] {
  const ticks: MonthTick[] = [];
  let lastMonth = -1;

  weeks.forEach((week, column) => {
    const firstDay = week.find((day): day is HeatmapDay => day !== null);
    if (!firstDay) return;

    const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
    if (month === lastMonth) return;

    lastMonth = month;
    const previous = ticks[ticks.length - 1];
    if (previous && column - previous.column < 2) return;

    ticks.push({ label: MONTH_NAMES[month], column });
  });

  return ticks;
}

export function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
