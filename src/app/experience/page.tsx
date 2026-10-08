import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CommandMenu } from "@/components/command-menu";
import { CurrentTime } from "@/components/CurrentTime";
import { DashedRule, SectionHeading } from "@/components/desi/section";
import { ExperienceList } from "@/components/ExperienceList";
import { Footer } from "@/components/Footer";
import { FooterBackground } from "@/components/FooterBackground";
import { RightNavbar } from "@/components/RightNavbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { experiences } from "@/data/experienceData";

export const metadata = {
  // The root layout's `template: "%s · Eshiv Pandey"` adds the site name; if it
  // were repeated here the tab would read "Experience — Eshiv Pandey · Eshiv Pandey".
  title: "Experience",
  description:
    "Full experience archive: open source with HAMi (CNCF) and Sugar Labs, founding engineering at Venturelync, and serverless AWS work at PandainUniv.",
};

export default function AllExperiencePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white transition-colors duration-300 dark:bg-black">
      <RightNavbar />

      {/* Blueprint guides */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-(--gutter) hidden w-0 border-r border-black/30 md:block dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 right-(--gutter-r) bottom-0 hidden w-0 border-r border-black/30 md:block dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[22vh] right-0 left-0 h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[calc(22vh+112px)] right-0 left-0 h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />

      {[
        { top: "22vh", left: "var(--gutter)" },
        { top: "22vh", right: "var(--gutter-r)" },
        { top: "calc(22vh + 112px)", left: "var(--gutter)" },
        { top: "calc(22vh + 112px)", right: "var(--gutter-r)" },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute z-10 hidden h-[2px] w-[2px] bg-black/50 md:block dark:bg-white/[0.25]"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            transform: `translate(${pos.right ? "50%" : "-50%"}, -50%)`,
          }}
        />
      ))}

      {/* Cell 1 */}
      <div className="pointer-events-auto absolute top-0 right-0 left-0 -z-0 h-[22vh] md:right-(--gutter-r) md:left-(--gutter)">
        <FooterBackground />
        <div className="pointer-events-auto absolute right-2 bottom-3 z-10">
          <CurrentTime />
        </div>
      </div>

      {/* Cell 2 */}
      <div className="absolute top-[22vh] right-0 left-0 z-50 flex h-[112px] items-center px-4 md:right-(--gutter-r) md:left-(--gutter)">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              aria-label="Back to home"
              className="group flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200/50 bg-zinc-100 text-zinc-400 transition-all hover:bg-zinc-200 hover:text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex flex-col justify-center">
              <h1 className="mb-0.5 text-[20px] leading-none font-bold tracking-tight text-zinc-800 [text-shadow:-1.5px_0_0_rgba(14,124,123,0.28),1.5px_0_0_rgba(233,162,8,0.38)] sm:text-[24px] dark:text-zinc-100 dark:[text-shadow:-1.5px_0_0_rgba(14,124,123,0.55),1.5px_0_0_rgba(233,162,8,0.6)]">
                All Experiences
              </h1>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Full experience archive
              </p>
            </div>
          </div>

          <div className="flex h-20 items-start justify-end gap-2 py-1 sm:h-24 sm:gap-3">
            <CommandMenu />
            <ThemeToggle className="dark:text-zinc-400 hover:dark:text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mr-0 ml-0 flex flex-col px-4 pt-[calc(22vh+112px)] pb-0 md:mr-(--gutter-r) md:ml-(--gutter)">
        <SectionHeading
          title="Experience"
          devanagari="अनुभव"
          aside={`${experiences.length} roles`}
        />

        <div className="relative pt-0 pb-6">
          <ExperienceList />
        </div>

        <div className="relative mt-2 pb-2">
          <DashedRule position="bottom" />
        </div>

        <Footer />
      </div>
    </div>
  );
}
