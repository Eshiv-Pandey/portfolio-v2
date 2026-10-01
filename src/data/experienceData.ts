/**
 * Work history, shared by the homepage list and the `/experience` archive.
 *
 * The template kept two copies of this array — one in each place — which had
 * already drifted apart. One source, two renderers.
 *
 * `description` is a block of lines. A line written as `Label: detail` renders
 * with the label bolded; `BOLD_TERMS` bolds the named projects and services
 * inside the detail.
 *
 * The entries live in `experience.json` so the dev-only Content Studio
 * (`/studio`) can rewrite them without touching code. This module keeps the
 * types and the `BOLD_TERMS` list and re-exports the data.
 */

import raw from "./experience.json";

export type Accent = "marigold" | "indigo" | "teal" | "rose";

export type ExperienceData = {
  title: string;
  role: string;
  dates: string;
  location: string;
  /** Two-letter monogram, used as the fallback when `logos` is empty. */
  mark: string;
  /** Org logos, newest convention: real marks the user dropped in
   *  `public/images/`. One renders solo in the tile; two render as an
   *  overlapping pair. Falls back to `mark` when omitted. */
  logos?: { src: string; alt: string }[];
  accent: Accent;
  type?: string;
  description: string;
  tech: string[];
  metrics?: { label: string; value: string }[];
};

/** Longest-first so `HAMi-core` wins over `HAMi`. */
export const BOLD_TERMS =
  "HAMi-core|HAMi|Sugar Labs|Music Blocks|Lync Terminal|Razorpay|HubSpot|Zoho Books|AWS Neuron|AppSync|DynamoDB|Amplify|Supabase|FastAPI";

export const experiences: ExperienceData[] = raw as ExperienceData[];
