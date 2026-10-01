/**
 * Medium has no public JSON API, but every profile publishes an RSS feed.
 * Reading it at request time (revalidated hourly) means new posts appear on
 * the site without a redeploy — which is the whole reason this isn't just a
 * hardcoded array like the template had.
 *
 * The feed is small and predictably shaped, so it's parsed with regexes
 * rather than pulling in an XML dependency for one document.
 */

export const MEDIUM_USERNAME = "eshivpandey";
export const MEDIUM_PROFILE_URL = `https://medium.com/@${MEDIUM_USERNAME}`;
export const MEDIUM_REVALIDATE = 3600;

/** Average adult prose speed. Medium itself uses ~265; 220 is kinder. */
const WORDS_PER_MINUTE = 220;

export interface MediumPost {
  title: string;
  /** Canonical post URL with Medium's RSS tracking params stripped. */
  link: string;
  /** ISO 8601, so the component controls its own formatting. */
  date: string;
  tags: string[];
  description: string;
  readingTime: string;
  /** First inline image, when the post has one. */
  image: string | null;
}

function stripCdata(value: string): string {
  const match = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (match ? match[1] : value).trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function readTag(xml: string, name: string): string | null {
  const match = xml.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`)
  );
  return match ? stripCdata(match[1]) : null;
}

function readAllTags(xml: string, name: string): string[] {
  const matches = xml.matchAll(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "g")
  );
  return Array.from(matches, (match) => stripCdata(match[1]));
}

/** Medium appends `?source=rss-…` to every link in the feed. */
function cleanLink(link: string): string {
  const index = link.indexOf("?");
  return index === -1 ? link : link.slice(0, index);
}

/** `open-source` → `Open Source`. */
function humanizeTag(tag: string): string {
  return tag
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toPlainText(html: string): string {
  return decodeEntities(
    html
      // Keep sentence boundaries that block elements imply.
      .replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(text: string, limit = 170): string {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[,;:.\s]+$/, "")}…`;
}

function readingTimeFor(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

function firstImage(html: string): string | null {
  const match = html.match(
    /<img[^>]+src=["'](https:\/\/(?:miro|cdn-images-\d+)\.medium\.com\/[^"']+)["']/i
  );
  return match ? decodeEntities(match[1]) : null;
}

export function parseMediumFeed(xml: string): MediumPost[] {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

  return items.flatMap(([, item]) => {
    const title = readTag(item, "title");
    const link = readTag(item, "link");
    if (!title || !link) return [];

    const body = readTag(item, "content:encoded") ?? "";
    const text = toPlainText(body);
    const pubDate = readTag(item, "pubDate");
    const parsedDate = pubDate ? new Date(pubDate) : null;

    return [
      {
        title: decodeEntities(title),
        link: cleanLink(link),
        date:
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toISOString()
            : new Date(0).toISOString(),
        tags: readAllTags(item, "category").map(humanizeTag),
        description: summarize(text),
        readingTime: readingTimeFor(text),
        image: firstImage(body),
      },
    ];
  });
}

/**
 * Returns an empty list rather than throwing — a Medium outage should cost
 * the writing section, not the whole page render.
 */
export async function getMediumPosts(
  username: string = MEDIUM_USERNAME
): Promise<MediumPost[]> {
  try {
    const response = await fetch(
      `https://medium.com/feed/@${encodeURIComponent(username)}`,
      {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
        next: { revalidate: MEDIUM_REVALIDATE },
      }
    );

    if (!response.ok) {
      throw new Error(`Medium feed responded ${response.status}`);
    }

    const posts = parseMediumFeed(await response.text());
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Failed to load Medium feed", error);
    return [];
  }
}
