/**
 * Highlights — the marquee strip under the projects grid.
 *
 * None of these four have a screenshot worth showing, so `image` is optional
 * and the card falls back to a generated <PosterCard> cover. Links point only
 * at pages that actually exist; the two hackathons have no public result page,
 * so they carry none rather than a guessed URL.
 *
 * The rows themselves live in `highlights.json` so the dev-only Content Studio
 * (`/studio`) can rewrite them without touching code. This module keeps the
 * type and re-exports the data; nothing else imports the JSON directly.
 */

import raw from "./highlights.json";

export type Highlight = {
  id: string;
  title: string;
  badge: string;
  image?: string;
  link?: string;
};

export const highlightsData: Highlight[] = raw as Highlight[];
