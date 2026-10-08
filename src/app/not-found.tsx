import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { CommandMenu } from "@/components/command-menu";
import { CurrentTime } from "@/components/CurrentTime";
import { FooterBackground } from "@/components/FooterBackground";
import { DASH_MASK, DASH_MASK_VERTICAL } from "@/components/desi/section";

/**
 * The 404.
 *
 * Same blueprint chrome as every other sub-page, with one difference: the
 * content cell is given over to `ref5` — Delhi truck art reading "हेल NA".
 * It's the one surface on the site where a joke costs nothing, so it gets the
 * loudest piece of the reference art at full saturation rather than as a wash.
 */
export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white transition-colors duration-300 dark:bg-black">
      {/* Vertical Lines - Ultra-fine Micro Dots */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-(--gutter) hidden w-0 border-r border-black/30 md:block dark:border-white/[0.15]"
        style={{ maskImage: DASH_MASK_VERTICAL, WebkitMaskImage: DASH_MASK_VERTICAL }}
      />
      <div
        className="pointer-events-none absolute top-0 bottom-0 right-(--gutter-r) hidden w-0 border-r border-black/30 md:block dark:border-white/[0.15]"
        style={{ maskImage: DASH_MASK_VERTICAL, WebkitMaskImage: DASH_MASK_VERTICAL }}
      />

      {/* Horizontal Lines - Ultra-fine Micro Dots */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-[22vh] h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{ maskImage: DASH_MASK, WebkitMaskImage: DASH_MASK }}
      />
      <div
        className="pointer-events-none absolute left-0 right-0 top-[calc(22vh+112px)] h-0 border-b border-black/30 dark:border-white/[0.15]"
        style={{ maskImage: DASH_MASK, WebkitMaskImage: DASH_MASK }}
      />

      {/* Ultra-Tiny Solid Nodes */}
      {[
        { top: "22vh", left: "var(--gutter)" },
        { top: "22vh", right: "var(--gutter-r)" },
        { top: "calc(22vh + 112px)", left: "var(--gutter)" },
        { top: "calc(22vh + 112px)", right: "var(--gutter-r)" },
      ].map((pos, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-10 hidden h-[2px] w-[2px] bg-black/50 md:block dark:bg-white/[0.25]"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            transform: `translate(${pos.right ? "50%" : "-50%"}, -50%)`,
          }}
        />
      ))}

      {/* Cell 1: Dot Matrix Background */}
      <div className="pointer-events-auto absolute left-0 right-0 top-0 -z-0 h-[22vh] md:left-(--gutter) md:right-(--gutter-r)">
        <FooterBackground />
        <div className="pointer-events-auto absolute bottom-3 right-2 z-10">
          <CurrentTime />
        </div>
      </div>

      {/* Cell 2: Header with Back Button + Title + Controls */}
      <div className="absolute left-0 right-0 top-[22vh] z-50 flex h-[112px] items-center px-4 md:left-(--gutter) md:right-(--gutter-r)">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="group flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200/50 bg-zinc-100 text-zinc-400 transition-all hover:bg-zinc-200 hover:text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex flex-col justify-center">
              <h1 className="mb-0.5 text-[20px] font-bold leading-none tracking-tight text-zinc-800 sm:text-[24px] dark:text-zinc-100 [text-shadow:-1.5px_0_0_rgba(14,124,123,0.28),1.5px_0_0_rgba(233,162,8,0.38)] dark:[text-shadow:-1.5px_0_0_rgba(14,124,123,0.55),1.5px_0_0_rgba(233,162,8,0.6)]">
                404
              </h1>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Page Not Found
              </p>
            </div>
          </div>

          <div className="flex h-20 items-start justify-end gap-2 py-1 sm:h-24 sm:gap-3">
            <CommandMenu />
            <ThemeToggle className="dark:text-zinc-400 hover:dark:text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 ml-0 mr-0 flex flex-col px-4 pt-[calc(22vh+112px)] pb-16 md:ml-(--gutter) md:mr-(--gutter-r)">
        <div className="reveal-up mt-8 flex flex-col items-center text-center">
          {/* The plate: a marigold border with the art inset, the same
              construction as the profile frame on the home page. */}
          <div
            className="w-full max-w-[520px] rounded-[10px] p-[5px] shadow-[0_18px_50px_-24px_rgba(179,32,44,0.65)]"
            style={{ backgroundColor: "var(--desi-marigold)" }}
          >
            <Image
              src="/images/notfound-truck.webp"
              alt={'Delhi truck art reading "हेल NA", hell nah'}
              width={735}
              height={510}
              preload
              sizes="(min-width: 768px) 520px, calc(100vw - 2rem)"
              className="h-auto w-full rounded-[6px]"
            />
          </div>

          <p className="mt-6 max-w-[440px] text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            Truck-art Hindi for{" "}
            <span className="font-devanagari" lang="hi">
              हेल NA
            </span>{" "}
            (<em>hell nah</em>). Which is roughly what the router said about that
            URL.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--desi-maroon)" }}
            >
              Back home
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-100 px-3.5 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:border-zinc-700/50 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              See the projects
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Separator */}
        <div className="relative mt-12">
          <div
            className="pointer-events-none absolute left-[-100vw] right-[-100vw] h-0 border-b border-black/30 dark:border-white/[0.15]"
            style={{ maskImage: DASH_MASK, WebkitMaskImage: DASH_MASK }}
          />
          <div className="pointer-events-none absolute -left-4 z-20 h-[2px] w-[2px] -translate-x-1/2 translate-y-[-1px] bg-black/50 dark:bg-white/[0.25]" />
          <div className="pointer-events-none absolute -right-4 z-20 h-[2px] w-[2px] translate-x-1/2 translate-y-[-1px] bg-black/50 dark:bg-white/[0.25]" />
        </div>
      </div>
    </div>
  );
}
