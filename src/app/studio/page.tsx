import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { STUDIO_ENABLED } from "@/lib/studio";
import { StudioClient } from "./StudioClient";

/**
 * `/studio` — the local-only content editor. The page renders during
 * `next dev`; a production build calls `notFound()` before anything else, so
 * the route is absent from the deployed site.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  if (!STUDIO_ENABLED) notFound();
  return <StudioClient />;
}
