"use client";

import { SOCIALS } from "@/lib/socials";
import { cn } from "@/lib/utils";
import SocialHoverCard from "@/components/pixel-perfect/social-hover-card";
import { StickerTile } from "@/components/StickerTile";
import styles from "./social-links.module.css";

export function SocialLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Social profiles" className={cn(styles.links, className)}>
      {SOCIALS.map(({ name, href, Icon, appearance }) => (
        <SocialHoverCard key={name} socialName={name}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`} className={styles.link}>
            <StickerTile appearance={appearance}>
              <Icon aria-hidden="true" className={styles.mark} />
            </StickerTile>
            <span className={styles.label}>{name}</span>
          </a>
        </SocialHoverCard>
      ))}
    </nav>
  );
}
