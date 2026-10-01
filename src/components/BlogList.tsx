import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

import type { MediumPost } from "@/lib/medium";
import { MEDIUM_PROFILE_URL } from "@/lib/medium";

/**
 * The writing list, fed by the Medium RSS feed rather than a hardcoded array.
 *
 * Layout is the template's, with two changes: posts are always external (they
 * live on Medium, there are no local article pages), and the clap count — which
 * the feed doesn't carry — is replaced by reading time.
 */

/** Fixed locale + timezone so the server and client agree on the string. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH =
  "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)";

export function BlogList({ posts }: { posts: MediumPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="relative -mx-4 px-4 py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-100vw] bottom-0 left-[-100vw] z-10 h-0 border-b border-black/30 dark:border-white/[0.15]"
          style={{ maskImage: DASH, WebkitMaskImage: DASH }}
        />
        <p className="text-center text-[13px] text-zinc-500 dark:text-zinc-400">
          Posts live on{" "}
          <a
            href={MEDIUM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-800 underline underline-offset-2 dark:text-zinc-200"
          >
            Medium
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="block">
      {posts.map((post, idx) => {
        const isLast = idx === posts.length - 1;

        return (
          <Link
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            key={post.link}
            className="group relative -mx-4 block cursor-pointer px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-0 z-10 h-0 border-b border-black/30 dark:border-white/[0.15] ${
                isLast ? "right-[-100vw] left-[-100vw]" : "right-0 left-0"
              }`}
              style={{ maskImage: DASH, WebkitMaskImage: DASH }}
            />
            {isLast && (
              <>
                <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-[2px] w-[2px] -translate-x-1/2 translate-y-1/2 bg-black/40 dark:bg-white/[0.25]" />
                <div className="pointer-events-none absolute right-0 bottom-0 z-20 h-[2px] w-[2px] translate-x-1/2 translate-y-1/2 bg-black/40 dark:bg-white/[0.25]" />
              </>
            )}

            <div className="flex w-full items-start justify-between sm:items-center">
              <div className="flex flex-col gap-2.5">
                <h3 className="pr-6 text-[14px] font-bold text-zinc-900 transition-colors group-hover:text-[var(--desi-rose)] md:text-[15px] dark:text-zinc-100">
                  {post.title}
                </h3>

                {post.description && (
                  <p className="max-w-[62ch] pr-6 text-[12.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {post.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[12px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={post.date}>
                      {DATE_FORMAT.format(new Date(post.date))}
                    </time>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-[var(--desi-teal)]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readingTime}</span>
                  </div>

                  {post.tags.length > 0 && (
                    <>
                      <div className="hidden h-3 w-[1px] bg-zinc-300 sm:block dark:bg-zinc-700" />
                      <div className="flex flex-wrap items-center gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-[4px] border border-black/30 bg-white/50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-white/[0.15] dark:bg-black/20 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="ml-4 flex-shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-100">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
