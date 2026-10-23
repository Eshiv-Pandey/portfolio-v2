"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./footer-favicon.module.css";

export function FooterFavicon() {
  const stage = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={stage} className={styles.stage} data-visible={visible} aria-hidden="true">
      <span className={styles.character}>
        <Image src="/images/favicon-red.png" alt="" width={64} height={64} unoptimized className={styles.face} />
        <span className={`${styles.pupil} ${styles.left}`} />
        <span className={`${styles.pupil} ${styles.right}`} />
      </span>
      <span className={styles.shadow} />
    </span>
  );
}
