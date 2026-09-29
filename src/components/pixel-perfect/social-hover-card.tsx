"use client";

import React, { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The peek card behind each social pill.
 *
 * The template had two layouts — a flat one and a banner one — because two of
 * its profiles had cover images. None of these four do, so the banner branch is
 * gone and every card renders flat.
 *
 * Stats are the numbers each platform actually shows on the profile, checked
 * against its public API. Anything not published there (LinkedIn connections)
 * is left out rather than estimated.
 */

interface SocialProfile {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  accent: string;
  stats: { label: string; value: string }[];
}

const AVATAR = "https://avatars.githubusercontent.com/u/194340770?v=4";

const socialProfiles: Record<string, SocialProfile> = {
  GitHub: {
    name: "Eshiv Pandey",
    handle: "Eshiv-Pandey",
    avatar: AVATAR,
    bio: "Full stack · DevOps · AI/ML. CNCF HAMi member.",
    location: "New Delhi, India (UTC +05:30)",
    accent: "var(--desi-marigold)",
    stats: [
      { value: "35", label: "Repositories" },
      { value: "805", label: "Contributions" },
    ],
  },
  LeetCode: {
    name: "Eshiv Pandey",
    handle: "Eshiv_Pandey",
    avatar: AVATAR,
    bio: "Daily DSA. Mostly mediums, working up the hards.",
    location: "New Delhi, India (UTC +05:30)",
    accent: "var(--desi-teal)",
    stats: [
      { value: "207", label: "Solved" },
      { value: "48", label: "Day streak" },
    ],
  },
  LinkedIn: {
    name: "Eshiv Pandey",
    handle: "in/eshiv-pandey18",
    avatar: AVATAR,
    bio: "B.Tech ECE @ University of Delhi, minor in AI & ML. Open to internships and new grad roles.",
    location: "New Delhi, India",
    accent: "var(--desi-indigo)",
    stats: [],
  },
  Medium: {
    name: "Eshiv Pandey",
    handle: "@eshivpandey",
    avatar: AVATAR,
    bio: "Notes on open source, systems, and getting started with contributing.",
    location: "New Delhi, India (UTC +05:30)",
    accent: "var(--desi-rose)",
    stats: [],
  },
};

interface SocialHoverCardProps {
  socialName: string;
  children: React.ReactNode;
}

export default function SocialHoverCard({
  socialName,
  children,
}: SocialHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const profile = socialProfiles[socialName];

  // No card configured for this pill — render the trigger untouched.
  if (!profile) {
    return <>{children}</>;
  }

  return (
    <HoverCard.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      openDelay={80}
      closeDelay={120}
    >
      <HoverCard.Trigger asChild>
        <span className="inline-block">{children}</span>
      </HoverCard.Trigger>
      <AnimatePresence>
        {isOpen && (
          <HoverCard.Portal forceMount>
            <HoverCard.Content
              asChild
              forceMount
              side="bottom"
              align="center"
              sideOffset={8}
              className="z-50 outline-none select-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 3, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "w-[230px] overflow-hidden rounded-xl shadow-2xl backdrop-blur-md sm:w-[250px]",
                  "border border-black/5 bg-white/95 dark:border-white/5 dark:bg-[#0c0c0e]/95",
                  "text-zinc-900 select-none dark:text-zinc-100"
                )}
              >
                {/* A hairline of the platform's accent along the top edge — the
                    only colour on an otherwise monochrome card. */}
                <div
                  aria-hidden="true"
                  className="h-[2px] w-full"
                  style={{ backgroundColor: profile.accent }}
                />

                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/5 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900">
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={48}
                        height={48}
                        loading="eager"
                        decoding="async"
                        quality={75}
                        sizes="48px"
                        className="h-full w-full object-cover opacity-90 grayscale"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <h3 className="truncate text-[13.5px] leading-tight font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                        {profile.name}
                      </h3>
                      <span className="mt-0.5 font-mono text-[11.5px] leading-none text-zinc-400 dark:text-zinc-500">
                        {profile.handle}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[12px] leading-relaxed text-zinc-800 dark:text-zinc-300">
                    {profile.bio}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500">
                      {profile.location}
                    </span>
                  </div>

                  {profile.stats.length > 0 && (
                    <div className="mt-3.5 flex items-center gap-5 border-t border-black/5 pt-3 text-[12px] text-zinc-400 dark:border-white/5 dark:text-zinc-500">
                      {profile.stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-1">
                          <span className="font-extrabold text-zinc-950 dark:text-zinc-100">
                            {stat.value}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </HoverCard.Content>
          </HoverCard.Portal>
        )}
      </AnimatePresence>
    </HoverCard.Root>
  );
}
