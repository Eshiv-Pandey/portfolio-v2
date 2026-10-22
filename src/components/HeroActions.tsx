import Link from "next/link";
import { FileText, Mail, MessageCircle } from "lucide-react";
import { StickerTile } from "@/components/StickerTile";
import { RESUME_URL } from "@/lib/site";
import styles from "./social-links.module.css";

export function HeroActions() {
  return (
    <nav aria-label="Get in touch" className={`${styles.links} ${styles.actions}`}>
      <a href="mailto:eshivpandey18@gmail.com" className={styles.link} aria-label="Send an email">
        <StickerTile appearance="email"><Mail aria-hidden="true" className={`${styles.mark} ${styles.lineMark}`} /></StickerTile>
        <span className={styles.label}>Email</span>
      </a>
      <Link href="/contact" className={styles.link}>
        <StickerTile appearance="contact"><MessageCircle aria-hidden="true" className={`${styles.mark} ${styles.lineMark}`} /></StickerTile>
        <span className={styles.label}>Contact</span>
      </Link>
      <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <StickerTile appearance="resume"><FileText aria-hidden="true" className={`${styles.mark} ${styles.lineMark}`} /></StickerTile>
        <span className={styles.label}>Résumé</span>
      </a>
    </nav>
  );
}
