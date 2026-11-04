"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { ArrowUpRight } from "lucide-react";
import { ClickMeSignature } from "@/components/ClickMeSignature";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import GlassFolder from "@/components/ui/glass-folder-cards";
import type { FolderFile } from "@/components/ui/glass-folder-cards";
import type { MediumPost } from "@/lib/medium";
import { MEDIUM_PROFILE_URL } from "@/lib/medium";
import styles from "./reading-folder.module.css";

export function BlogList({ posts }: { posts: MediumPost[] }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(280);
  const [headerStep, setHeaderStep] = useState(76);
  const readingRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const episodes = posts.slice(0, 2);
  const files: FolderFile[] = episodes.map((post, index) => ({
    name: post.title,
    meta: `Episode ${post.title.match(/^EP0*(\d+)/i)?.[1] ?? index + 1} · ${post.readingTime}`,
    image: post.image ?? undefined,
    href: post.link,
  }));

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const headers = stage.querySelectorAll<HTMLElement>(".gf-sheet-head");
      if (!headers.length) return;
      const tallest = Math.max(...Array.from(headers, (header) => header.getBoundingClientRect().height / (width / 340)));
      const step = Math.max(50, Math.ceil(tallest + 18));
      setHeaderStep((previous) => Math.abs(previous - step) > 1 ? step : previous);
    };
    const observer = new ResizeObserver((entries) => {
      const entry = entries.find((item) => item.target === stage);
      if (entry) setWidth(Math.min(440, Math.max(140, entry.contentRect.width)));
      measure();
    });
    observer.observe(stage);
    stage.querySelectorAll(".gf-sheet-head").forEach((header) => observer.observe(header));
    measure();
    return () => observer.disconnect();
  }, [width, posts]);

  if (episodes.length === 0) {
    return <div className={styles.empty}><p>The episodes live on Medium.</p><a href={MEDIUM_PROFILE_URL} target="_blank" rel="noopener noreferrer">Read on Medium <ArrowUpRight size={15} aria-hidden="true" /></a></div>;
  }

  return (
    <div ref={readingRef} className={styles.reading} style={{
      "--reading-scale": width / 340,
      "--reading-header-step": `${headerStep}px`,
      "--reading-headroom": `${Math.max(76, (headerStep * 2 - 120) * (width / 340) + 24)}px`,
    } as CSSProperties}>
      <div ref={stageRef} className={styles.stage}>
        {!open && <div className={styles.hint} aria-hidden="true">
          <ClickMeSignature className={styles.hintText} />
          <svg viewBox="0 0 76 72" fill="none">
            <path d="M62 6C69 34 48 58 12 64M12 64L23 50M12 64L30 66" />
          </svg>
        </div>}
        <GlassFolder
          key={episodes.map((post) => post.link).join("|")}
          label="Reading"
          meta={`${episodes.length} ${episodes.length === 1 ? "episode" : "episodes"} on Medium`}
          art="aurora"
          files={files}
          action="none"
          width={width}
          open={open}
          onOpenChange={setOpen}
          dismissBoundaryRef={readingRef}
          tone={resolvedTheme === "dark" ? "dark" : "light"}
          appear={false}
          className={styles.folder}
        />
      </div>
      <div className={styles.controls} role="group" aria-label="Writing actions">
        <LiquidMetalButton label={open ? "Close folder" : "Open folder"} expanded={open} onClick={() => setOpen((value) => !value)} />
        <LiquidMetalButton label="Medium" href={MEDIUM_PROFILE_URL} />
      </div>
    </div>
  );
}
