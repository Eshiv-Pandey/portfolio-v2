import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadata carrier for the Client Component at `pull-requests/page.tsx`.
 *  See `src/app/projects/layout.tsx` for why this file exists. */
export const metadata: Metadata = {
  title: "Open Source",
  description:
    "Pull requests to HAMi (CNCF) and Sugar Labs' Music Blocks, pulled live from the GitHub search API.",
};

export default function PullRequestsLayout({ children }: { children: ReactNode }) {
  return children;
}
