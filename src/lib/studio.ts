import path from "node:path";

/**
 * Content Studio — the "editable content, only me" answer for a site that
 * deploys as static files with zero secrets.
 *
 * The safest possible editor for that model is one that does not exist in
 * production at all: there is no auth to get wrong, no database, no writable
 * endpoint on the deployed site, and so nothing to attack. Instead the Studio
 * runs only on your own machine during `next dev`, and it edits the repo's own
 * JSON data files in place. You review the diff and commit it like any other
 * change, and the deploy picks it up. Editing content becomes a normal git
 * change made through a form instead of by hand.
 *
 * Everything here is gated on {@link STUDIO_ENABLED}. The API route 404s and
 * the `/studio` page calls `notFound()` when it is false, so a production build
 * ships the guard but never the capability.
 */

/** True only outside a production build — i.e. during local `next dev`. */
export const STUDIO_ENABLED = process.env.NODE_ENV !== "production";

/**
 * The collections the Studio may read and write, each pinned to one file under
 * `src/data`. The API only ever touches a path from this map, so a request can
 * never reach an arbitrary file however the body is shaped.
 */
export const COLLECTIONS = {
  experience: {
    label: "Experience",
    file: "experience.json",
    description: "Work history shown on the homepage and /experience.",
  },
  highlights: {
    label: "Highlights",
    file: "highlights.json",
    description: "The marquee strip of awards and memberships.",
  },
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

export function isCollectionKey(value: unknown): value is CollectionKey {
  return typeof value === "string" && value in COLLECTIONS;
}

/** Absolute path to a collection's JSON file, resolved from the repo root. */
export function collectionPath(key: CollectionKey): string {
  return path.join(process.cwd(), "src", "data", COLLECTIONS[key].file);
}
