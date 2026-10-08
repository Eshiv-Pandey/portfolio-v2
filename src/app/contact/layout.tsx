import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadata carrier for the Client Component at `contact/page.tsx`.
 *  See `src/app/projects/layout.tsx` for why this file exists. */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Eshiv Pandey: email, LinkedIn, GitHub, or the form on this page.",
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
