"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SECTIONS } from "@/lib/sections";

export function RightNavbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  // Hidden once the footer scrolls into view so the fixed index never floats
  // over it (the footer is full-bleed and would otherwise collide).
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // A second observer just for the footer: the index fades out the moment
    // any of the footer enters the viewport and returns when it leaves.
    const footer = document.getElementById("site-footer");
    let footerObserver: IntersectionObserver | undefined;
    if (footer) {
      footerObserver = new IntersectionObserver(
        ([entry]) => setFooterVisible(entry.isIntersecting),
        { threshold: 0 }
      );
      footerObserver.observe(footer);
    }

    return () => {
      observer.disconnect();
      footerObserver?.disconnect();
    };
  }, [pathname]);

  // Only render on the homepage where the #hash sections exist
  if (pathname !== "/") return null;

  return (
    <div
      className={`fixed inset-0 z-50 hidden transition-opacity duration-500 lg:block ${
        footerVisible ? "pointer-events-none opacity-0" : "pointer-events-none opacity-100"
      }`}
      style={{ width: 'calc(100vw - var(--removed-body-scroll-bar-size, 0px))' }}
    >
      {/* The index lives in `--rail`, the strip the content column leaves
          free inside the right-hand gutter (see globals.css). */}
      <nav className={`absolute top-[22vh] right-(--gutter) max-w-(--rail) flex flex-col gap-4 mt-2 ${footerVisible ? "pointer-events-none" : "pointer-events-auto"}`}>
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase mb-1">Index</h3>
        {SECTIONS.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <Link
              key={link.id}
              href={`#${link.id}`}
              className={`text-[12px] font-medium tracking-[0.05em] transition-all duration-300 ease-out flex items-center gap-3 ${isActive
                  ? "text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                }`}
            >
              <span
                className={`h-[1px] transition-all duration-300 ease-out ${isActive ? "w-3" : "w-0"}`}
                style={{ backgroundColor: isActive ? "var(--desi-marigold)" : "transparent" }}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
