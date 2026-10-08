import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TITLE_TEMPLATE } from "@/lib/site";

/**
 * A layout that exists only to carry metadata.
 *
 * `projects/page.tsx` is a Client Component (it owns the video lightbox state),
 * and the `metadata` export is Server-Component-only. Rather than split the page
 * in two for the sake of a `<title>`, the title lives in the segment's layout —
 * which Next resolves the same way.
 *
 * `template` is restated because a bare string `title` here would resolve as
 * `{ absolute, template: null }` and strip the site name from `/projects/[slug]`
 * underneath. `default` supplies this segment's own title.
 */
export const metadata: Metadata = {
  title: {
    default: "Projects",
    template: TITLE_TEMPLATE,
  },
  description:
    "Every project: KeyV DB, a from-scratch storage engine in C++17; Switch, a multi-model AI hivemind; and the rest of the build log.",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
