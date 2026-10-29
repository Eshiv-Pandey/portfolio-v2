import Link from "next/link";

import { ActivityHeatmaps } from "@/components/ActivityHeatmaps";
import { BlogList } from "@/components/BlogList";
import { CommandMenu } from "@/components/command-menu";
import { DashedRule, SectionHeading } from "@/components/desi/section";
import { DesiDivider } from "@/components/desi/DesiDivider";
import { JaaliFrame } from "@/components/desi/JaaliFrame";
import { ExperienceList } from "@/components/ExperienceList";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { ProfileFlip } from "@/components/ProfileFlip";
import { Highlights } from "@/components/Highlights";
import { OpenSourceContributions } from "@/components/OpenSourceContributions";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Reveal } from "@/components/Reveal";
import { RightNavbar } from "@/components/RightNavbar";
import { TechStack } from "@/components/TechStack";
import { ThemeToggle } from "@/components/theme-toggle";
import { SocialLinks } from "@/components/SocialLinks";
import { HeroActions } from "@/components/HeroActions";
import { getMediumPosts } from "@/lib/medium";

const NAME = "Eshiv Pandey";

/** The pill that closes a section and links to its full page. */
function ViewAll({
  href,
  external = false,
  label = "View All",
}: {
  href: string;
  external?: boolean;
  label?: string;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group relative mt-0 block"
    >
      <div className="pointer-events-none absolute -inset-[5px] rounded-[11px] border border-black/5 transition-colors duration-300 group-hover:border-black/10 dark:border-white/5 dark:group-hover:border-white/10" />
      <div className="relative flex items-center gap-1.5 rounded-[6px] border border-black/5 bg-zinc-50 px-4 py-2 text-[13px] font-medium text-zinc-600 shadow-sm shadow-black/20 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/5 dark:bg-[#09090b] dark:text-zinc-400 dark:shadow-lg dark:shadow-black/80 dark:hover:bg-[#121214] dark:hover:text-zinc-100">
        {label}
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </Link>
  );
}

/** The footer strip a list section sits on: a dashed rule and a centred link. */
function ViewAllRow(props: React.ComponentProps<typeof ViewAll>) {
  return (
    <div className="relative -mx-4 flex justify-center rounded-b-lg px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20">
      <DashedRule position="bottom" nodes="edge" />
      <ViewAll {...props} />
    </div>
  );
}

export default async function Home() {
  const posts = await getMediumPosts();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white transition-colors duration-300 dark:bg-black">
      <RightNavbar />

      {/* Blueprint guides — the two page gutters (see `--gutter` in
          globals.css) and the two horizontal rules that box the banner and
          profile cells. */}
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
        className="pointer-events-none absolute top-[26vh] right-0 left-0 h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[calc(26vh+112px)] right-0 left-0 h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{
          maskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
        }}
      />

      {[
        { top: "26vh", left: "var(--gutter)" },
        { top: "26vh", right: "var(--gutter-r)" },
        { top: "calc(26vh + 112px)", left: "var(--gutter)" },
        { top: "calc(26vh + 112px)", right: "var(--gutter-r)" },
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

      {/* Cell 1: the pixel sky and the swinging sprite. Taller than the shared
          22vh default so the oversized profile photo can straddle its edge. */}
      <HeroBanner height="26vh" />

      {/* Cell 2: profile. The photo is deliberately taller than this 112px cell
          and pulled upward, so its top half rises into the banner and its lower
          half sits in the cell beside the name. */}
      <div className="absolute top-[26vh] right-0 left-0 z-40 flex h-[112px] items-center px-4 md:right-(--gutter-r) md:left-(--gutter)">
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <JaaliFrame
              src="/images/pic1.jpeg"
              alt={NAME}
              preload
              shape="square"
              sizes="(min-width: 640px) 144px, 112px"
              className="-mt-8 size-28 sm:-mt-10 sm:size-36"
            >
              <ProfileFlip
                images={[
                  { src: "/images/pic1.jpeg", alt: NAME },
                  { src: "/images/pic2.jpeg", alt: NAME },
                ]}
                sizes="(min-width: 640px) 144px, 112px"
              />
            </JaaliFrame>

            <div className="flex min-w-0 flex-col justify-center">
              <h1 className="mb-0.5 font-pixel text-[22px] leading-none font-bold text-zinc-800 [text-shadow:-1.5px_0_0_rgba(14,124,123,0.28),1.5px_0_0_rgba(233,162,8,0.38)] sm:text-[28px] dark:text-zinc-100 dark:[text-shadow:-1.5px_0_0_rgba(14,124,123,0.55),1.5px_0_0_rgba(233,162,8,0.6)]">
                <span className="reveal-up inline-block">{NAME}</span>
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500 sm:text-[14px] dark:text-zinc-400">21, Engineer &amp; open-source contributor.</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2.5 py-1">
            <div data-hero-controls className="absolute right-4 -top-20 flex items-center gap-2 sm:gap-3 min-[900px]:static">
              <CommandMenu />
              <ThemeToggle className="dark:text-zinc-400 hover:dark:text-zinc-300" />
            </div>
            {/* The right-hand empty space under the toggle. Hidden on narrow
                screens, where it falls back into the content column below. */}
            <SocialLinks className="ml-auto !hidden justify-end min-[900px]:!flex" />
          </div>
        </div>
      </div>

      {/* Flowing content */}
      <div className="relative z-10 mr-0 ml-0 flex min-h-screen flex-col px-4 pt-[calc(26vh+112px)] pb-0 md:mr-(--gutter-r) md:ml-(--gutter)">
        <div className="grid gap-5 pt-1 min-[900px]:grid-cols-[minmax(0,1fr)_280px] min-[900px]:items-start">
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-[68ch] text-[14px] leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-300">
            Building backends, infrastructure, and databases.
          </p>
        </Reveal>

          <div className="flex w-full flex-col items-center gap-4 min-[900px]:w-[280px] min-[900px]:items-end">
            <SocialLinks className="min-[900px]:!hidden" />
            <HeroActions />
          </div>
        </div>

        {/* Experience */}
        <section
          id="experience"
          className="relative z-10 mt-6 flex scroll-mt-24 flex-col"
        >
          <SectionHeading title="Experience" devanagari="अनुभव" topRule />
          <div className="mt-0 block">
            <ExperienceList />
            <ViewAllRow href="/experience" />
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="relative z-10 mt-0 flex scroll-mt-24 flex-col"
        >
          <SectionHeading title="Projects" devanagari="परियोजनाएँ" />

          <div className="relative px-4 pt-6 pb-12">
            {/* The gutter between the two project columns. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-6 left-1/2 hidden w-0 -translate-x-1/2 border-r border-black/30 md:block dark:border-white/[0.15]"
              style={{
                maskImage:
                  "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
                WebkitMaskImage:
                  "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)",
              }}
            />

            <ProjectsGrid />

            <DashedRule position="bottom" />
          </div>

          {/* Sits on the rule above, so it needs to clear it. */}
          <div className="relative z-20 -mt-[19px] flex justify-center pb-0">
            <ViewAll href="/projects" />
          </div>
        </section>

        <DesiDivider pattern="tile" height={30} className="mt-6" />

        {/* Both heatmaps — this section owns #activity. */}
        <ActivityHeatmaps />

        {/* Open source */}
        <div id="opensource" className="mt-6 scroll-mt-24">
          <OpenSourceContributions />
        </div>

        <DesiDivider pattern="jaali" height={26} reverse className="mt-2" />

        {/* Skills */}
        <section
          id="skills"
          className="relative z-10 mt-6 flex scroll-mt-24 flex-col"
        >
          <SectionHeading
            title="Skills & Technologies"
            devanagari="कौशल"
            topRule
          />
          <Reveal className="relative">
            <TechStack />
          </Reveal>
        </section>

        {/* Writing */}
        <section
          id="writing"
          className="relative mt-6 flex scroll-mt-24 flex-col"
        >
          <SectionHeading
            title="Writing"
            devanagari="लेखन"
            topRule
            aside={posts.length > 0 ? `${posts.length} on Medium` : undefined}
          />
          <BlogList posts={posts} />
        </section>

        {/* Highlights */}
        <section
          id="highlights"
          className="relative z-10 mt-6 flex scroll-mt-24 flex-col"
        >
          <SectionHeading title="Highlights" devanagari="उपलब्धियाँ" topRule />
          <Highlights />
          <div className="relative mt-4 pb-4">
            <DashedRule position="bottom" />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
