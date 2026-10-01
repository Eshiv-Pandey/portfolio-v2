"use client";

import Image from "next/image";
import { useState } from "react";

import { DashedRule } from "@/components/desi/section";
import { Reveal } from "@/components/Reveal";
import {
  BOLD_TERMS,
  experiences,
  type ExperienceData,
} from "@/data/experienceData";

/** Built once — `split` needs the capture group, `test` needs the anchors. */
const SPLIT_RE = new RegExp(`(${BOLD_TERMS})`);
const MATCH_RE = new RegExp(`^(${BOLD_TERMS})$`);

/** A single logo on a light chip, so transparent/dark marks read in dark mode. */
function LogoChip({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={`grid place-items-center overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm shadow-black/15 dark:border-white/15 dark:shadow-black/50 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className="size-[76%] object-contain"
      />
    </span>
  );
}

/**
 * The org badge: real logos when the entry ships them, a monogram tile
 * otherwise. One logo fills a single tile; two stack as an overlapping pair;
 * three or more become an overlapping row. The accent colour still drives the
 * monogram fallback.
 */
function OrgMark({ item }: { item: ExperienceData }) {
  const accent = `var(--desi-${item.accent})`;

  if (item.logos && item.logos.length > 0) {
    if (item.logos.length === 1) {
      return <LogoChip src={item.logos[0].src} alt={item.logos[0].alt} className="size-10" />;
    }
    if (item.logos.length === 2) {
      // Overlapping pair: the second sits behind and to the right.
      return (
        <div className="relative size-10 shrink-0">
          <LogoChip
            src={item.logos[1].src}
            alt={item.logos[1].alt}
            className="absolute top-1 right-0 size-7"
          />
          <LogoChip
            src={item.logos[0].src}
            alt={item.logos[0].alt}
            className="absolute bottom-0 left-0 size-7 ring-2 ring-white dark:ring-[#0a0a0a]"
          />
        </div>
      );
    }
    // Three (or more) logos: an overlapping row, each ringed so the stack
    // stays legible. Only the first three are drawn.
    return (
      <div className="flex shrink-0 items-center -space-x-2">
        {item.logos.slice(0, 3).map((logo) => (
          <LogoChip
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            className="size-7 ring-2 ring-white dark:ring-[#0a0a0a]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="size-10 shrink-0 rounded-[10px] border border-black/10 bg-zinc-50 p-[2px] shadow-sm shadow-black/15 dark:border-zinc-800 dark:bg-[#111111] dark:shadow-md dark:shadow-black/50">
      <div
        className="flex size-full items-center justify-center rounded-[7px] border border-black/5 dark:border-black/20"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 13%, transparent)`,
        }}
      >
        <span
          aria-hidden="true"
          className="font-heading text-[13px] leading-none font-black tracking-tight"
          style={{ color: accent }}
        >
          {item.mark}
        </span>
      </div>
    </div>
  );
}

/** Bolds the `Label:` prefix and the named projects inside the detail. */
function Bullet({ point }: { point: string }) {
  const [label, ...rest] = point.split(":");
  const detail = rest.join(":");

  return (
    <li className="flex items-start gap-1.5">
      <span className="mt-[2px] text-[14px] leading-none text-zinc-400 dark:text-zinc-500">
        •
      </span>
      <span>
        {rest.length > 0 ? (
          <>
            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
              {label}:
            </strong>
            {detail.split(SPLIT_RE).map((part, i) =>
              MATCH_RE.test(part) ? (
                <strong
                  key={i}
                  className="font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </>
        ) : (
          point
        )}
      </span>
    </li>
  );
}

export function ExperienceList() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="block">
      {experiences.map((item, idx) => {
        const isOpen = openIdx === idx;
        const isLast = idx === experiences.length - 1;

        return (
          <Reveal
            key={item.title}
            delay={0.04 * idx}
            y={10}
            className="group relative"
          >
            {/* The last row's rule runs full-bleed and carries the nodes; the
                rest stop at the content box. */}
            {isLast ? (
              <DashedRule position="bottom" />
            ) : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-16px] bottom-0 left-[-16px] z-10 h-0 border-b border-black/30 dark:border-white/[0.15]"
                style={{
                  maskImage:
                    "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
                  WebkitMaskImage:
                    "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
                }}
              />
            )}

            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="relative z-20 -mx-4 flex w-[calc(100%+32px)] cursor-pointer flex-col items-start gap-2.5 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-zinc-50 sm:gap-3 sm:py-4 2xl:flex-row 2xl:items-center 2xl:justify-between dark:hover:bg-zinc-900/20"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                <OrgMark item={item} />

                <div className="flex min-w-0 flex-col gap-0.5 pr-2 sm:pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] leading-tight font-bold text-zinc-900 sm:text-[17px] dark:text-zinc-100">
                      {item.title}
                    </span>
                    {item.type && (
                      <span className="self-center rounded-[4px] border border-zinc-300/50 bg-zinc-200/50 px-1.5 py-[1px] text-[11px] font-medium whitespace-nowrap text-zinc-600 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-400">
                        {item.type}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[14px] text-zinc-600 sm:text-[15px] dark:text-zinc-400">
                    {item.role}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-0.5 pr-5 pl-[52px] text-left sm:pl-[56px] 2xl:mt-0 2xl:items-end 2xl:pl-0 2xl:text-right">
                <div className="relative flex items-center text-[13px] font-medium text-zinc-900 sm:text-[14px] dark:text-zinc-100">
                  <span>{item.dates}</span>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={`absolute top-1/2 -right-5 -mt-[1.5px] h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <span className="text-[13px] text-zinc-500 sm:text-[14px] dark:text-zinc-400">
                  {item.location}
                </span>
              </div>
            </button>

            {/* Expandable details */}
            <div
              className={`-mx-4 grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`${
                    isOpen
                      ? "translate-y-0 pt-0 pb-4 opacity-100"
                      : "-translate-y-2 pt-0 pb-0 opacity-0"
                  } pr-8 pl-6 text-[14px] text-zinc-600 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] dark:text-zinc-400`}
                >
                  {item.metrics && (
                    <div className="relative -mr-8 -ml-6 mb-4">
                      <div className="grid max-w-full grid-cols-2 pr-8 pl-6 2xl:grid-cols-4">
                        {item.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="relative min-w-0 px-3 py-2 after:absolute after:top-0 after:right-0 after:bottom-0 after:w-0 after:border-r after:border-black/30 after:[mask-image:repeating-linear-gradient(to_bottom,black_0,black_1px,transparent_1px,transparent_6px)] [&:nth-child(2n)]:after:hidden 2xl:[&:not(:last-child)]:after:block 2xl:[&:last-child]:after:hidden dark:after:border-white/[0.15]"
                          >
                            <p
                              className={`${
                                metric.value.includes(" - ")
                                  ? "text-[13px]"
                                  : "text-[16px]"
                              } leading-none font-bold whitespace-nowrap text-zinc-900 dark:text-zinc-100`}
                            >
                              {metric.value}
                            </p>
                            <p className="mt-1 text-[10px] font-medium uppercase text-zinc-400 dark:text-zinc-600">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Boxed, not full-bleed — these rules stop at the metric
                          grid rather than crossing the page. */}
                      {["top-0", "top-1/2 2xl:hidden", "bottom-0"].map((pos) => (
                        <span
                          key={pos}
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-x-0 ${pos} h-0 border-t border-black/30 dark:border-white/[0.15]`}
                          style={{
                            maskImage:
                              "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
                            WebkitMaskImage:
                              "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)",
                          }}
                        />
                      ))}
                      {[
                        "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                        "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                        "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                        "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
                      ].map((pos) => (
                        <span
                          key={pos}
                          aria-hidden="true"
                          className={`pointer-events-none absolute ${pos} h-[2px] w-[2px] bg-black/50 dark:bg-white/[0.25]`}
                        />
                      ))}
                    </div>
                  )}

                  <ul className="mb-4 space-y-2 text-[13px] leading-relaxed">
                    {item.description
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((point, i) => (
                        <Bullet key={i} point={point} />
                      ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-[4px] border border-zinc-200/50 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:border-zinc-800/50 dark:bg-[#111111] dark:text-zinc-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
