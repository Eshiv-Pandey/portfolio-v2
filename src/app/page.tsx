import Link from "next/link";
// simple-icons dropped the LinkedIn mark over trademark, so that one glyph
// comes from Font Awesome instead.
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiLeetcode, SiMedium } from "react-icons/si";
import type { IconType } from "react-icons";

import { ActivityHeatmaps } from "@/components/ActivityHeatmaps";
import { BlogList } from "@/components/BlogList";
import { CommandMenu } from "@/components/command-menu";
import { DashedRule, SectionHeading } from "@/components/desi/section";
import { DesiDivider } from "@/components/desi/DesiDivider";
import { JaaliFrame } from "@/components/desi/JaaliFrame";
import { ExperienceList } from "@/components/ExperienceList";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { Highlights } from "@/components/Highlights";
import { OpenSourceContributions } from "@/components/OpenSourceContributions";
import { ProfileFlip } from "@/components/ProfileFlip";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Reveal } from "@/components/Reveal";
import { RightNavbar } from "@/components/RightNavbar";
import { TechStack } from "@/components/TechStack";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconGrid, type IconGridItem } from "@/components/ui/icon-set";
import SocialHoverCard from "@/components/pixel-perfect/social-hover-card";
import SoftPillButton from "@/components/pixel-perfect/soft-pill-button";
import { getMediumPosts, MEDIUM_PROFILE_URL } from "@/lib/medium";
import { RESUME_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const EMAIL = "eshivpandey18@gmail.com";
const NAME = "Eshiv Pandey";

/** Shown bare under the name, the way the reference portfolio does it. */
const AGE = 21;

const socials: { name: string; href: string; Icon: IconType }[] = [
  { name: "GitHub", href: "https://github.com/Eshiv-Pandey", Icon: SiGithub },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/eshiv-pandey18/",
    Icon: FaLinkedinIn,
  },
  { name: "Medium", href: MEDIUM_PROFILE_URL, Icon: SiMedium },
  {
    name: "LeetCode",
    href: "https://leetcode.com/u/Eshiv_Pandey/",
    Icon: SiLeetcode,
  },
];

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

/**
 * The social links as a row of icon tiles (see components/ui/icon-set). Each
 * tile keeps the original hover: the peek card from <SocialHoverCard> and a
 * gentle icon-brighten, not the icon-set's default lift. Rendered in two places
 * — the profile header's right column on wide screens, the content column on
 * narrow ones — so it lives in one place.
 */
function SocialPills({ className = "" }: { className?: string }) {
  const items: IconGridItem[] = socials.map(({ name, href, Icon }) => ({
    id: name,
    name,
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <SocialHoverCard socialName={name}>
        <span className="flex items-center justify-center opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </SocialHoverCard>
    ),
  }));

  return (
    <IconGrid
      items={items}
      className={cn("w-fit gap-2", className)}
      itemClassName="size-11 border-black/5 bg-zinc-50 transition-colors group-hover:border-black/10 dark:border-white/5 dark:bg-[#0c0c0e] dark:group-hover:border-white/10"
    />
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
      <div className="absolute top-[26vh] right-0 left-0 z-50 flex h-[112px] items-center px-4 md:right-(--gutter-r) md:left-(--gutter)">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
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

            <div className="flex flex-col justify-center">
              <h1 className="mb-0.5 text-[20px] leading-none font-bold tracking-tight text-zinc-800 [text-shadow:-1.5px_0_0_rgba(14,124,123,0.28),1.5px_0_0_rgba(233,162,8,0.38)] sm:text-[24px] dark:text-zinc-100 dark:[text-shadow:-1.5px_0_0_rgba(14,124,123,0.55),1.5px_0_0_rgba(233,162,8,0.6)]">
                {/* Per-character entrance. Pure CSS so the name doesn't wait on
                    hydration; `.reveal-up` is disabled under reduced motion. */}
                <span className="sr-only">{NAME}</span>
                <span aria-hidden="true">
                  {NAME.split("").map((char, i) => (
                    <span
                      key={i}
                      className="reveal-up inline-block"
                      style={{ animationDelay: `${80 + i * 30}ms` }}
                    >
                      {char === " " ? " " : char}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="text-[13px] text-zinc-500 sm:text-[14px] dark:text-zinc-400">
                New Delhi, India
                <span aria-hidden="true" className="mx-1.5 text-zinc-300 dark:text-zinc-600">
                  ·
                </span>
                <span className="sr-only">Age </span>
                {AGE}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 py-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <CommandMenu />
              <ThemeToggle className="dark:text-zinc-400 hover:dark:text-zinc-300" />
            </div>
            {/* The right-hand empty space under the toggle. Hidden on narrow
                screens, where it falls back into the content column below. */}
            <SocialPills className="ml-auto hidden justify-end sm:flex" />
          </div>
        </div>
      </div>

      {/* Flowing content */}
      <div className="relative z-10 mr-0 ml-0 flex min-h-screen flex-col px-4 pt-[calc(26vh+112px)] pb-0 md:mr-(--gutter-r) md:ml-(--gutter)">
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-[68ch] text-[14px] leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-300">
            Engineer. I build backends, infrastructure, and the occasional
            database from scratch.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <ul className="mt-4 max-w-[78ch] pl-4 text-[14px] leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-300">
            <li className="flex gap-1.5">
              <span>•</span>
              <span>
                B.Tech ECE at the{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  University of Delhi
                </span>
                , minor in AI &amp; ML.
              </span>
            </li>
            <li className="flex gap-1.5">
              <span>•</span>
              <span>
                Member of{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  HAMi
                </span>{" "}
                (CNCF): GPU scheduling for Kubernetes. Also contributing to
                Sugar Labs&apos; Music Blocks.
              </span>
            </li>
            <li className="flex gap-1.5">
              <span>•</span>
              <span>
                Founding engineer at{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Venturelync
                </span>
                , where I built the platform and{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Lync Terminal
                </span>{" "}
                from scratch.
              </span>
            </li>
            <li className="flex gap-1.5">
              <span>•</span>
              <span>
                Currently writing{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  KeyV DB
                </span>
                , a C++17 storage engine with B+Tree indexing, a WAL, and
                ARIES-style crash recovery.
              </span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SoftPillButton
              as="a"
              href={`mailto:${EMAIL}`}
              variant="primary"
              className="px-3 py-1.5 !text-[12px]"
            >
                <div className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Send an email
                </div>
              </SoftPillButton>

              <Link href="/contact">
                <SoftPillButton
                  as="span"
                  variant="secondary"
                  className="px-3 py-1.5 !text-[12px]"
                >
                  <div className="flex items-center gap-1.5 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Contact
                  </div>
                </SoftPillButton>
              </Link>

              <SoftPillButton
                as="a"
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="px-3 py-1.5 !text-[12px]"
              >
                <div className="flex items-center gap-1.5 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                  Résumé
                </div>
              </SoftPillButton>
          </div>
        </Reveal>

        {/* Socials now live in the profile header's right column; on narrow
            screens there's no room there, so they fall back to here. The grid
            runs its own entrance, so no <Reveal> wrapper. */}
        <SocialPills className="mt-6 flex sm:hidden" />

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
          <ViewAllRow href={MEDIUM_PROFILE_URL} external label="Read on Medium" />
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
