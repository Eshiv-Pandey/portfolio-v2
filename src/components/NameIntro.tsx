"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NameSignature } from "@/components/NameSignature";
import { INTRO_DURATION, INTRO_FINISHED_EVENT } from "@/lib/intro";
import styles from "./name-intro.module.css";

export function NameIntro() {
  const [finished, setFinished] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const completed = useRef(false);
  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    setFinished(true);
    window.dispatchEvent(new Event(INTRO_FINISHED_EVENT));
  }, []);

  useEffect(() => {
    if (finished) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const covered = new Map<HTMLElement, boolean>();
    if (!reduced) {
      for (const element of document.body.children) {
        if (!(element instanceof HTMLElement) || element === shellRef.current || ["SCRIPT", "STYLE"].includes(element.tagName)) continue;
        covered.set(element, element.inert);
        element.inert = true;
      }
      skipRef.current?.focus({ preventScroll: true });
    }
    const timer = window.setTimeout(finish, reduced ? 0 : INTRO_DURATION);
    return () => {
      window.clearTimeout(timer);
      for (const [element, inert] of covered) element.inert = inert;
      if (previousFocus?.isConnected && !previousFocus.inert) previousFocus.focus({ preventScroll: true });
    };
  }, [finish, finished]);

  if (finished) return null;

  return (
    <div ref={shellRef} data-name-intro className={styles.shell} role="region" aria-label="Eshiv Pandey introduction">
      <div className={styles.paper}>
        <div className={styles.signature}>
          <NameSignature className={styles.name} />
        </div>
      </div>
      <div className={styles.fold} />
      <button ref={skipRef} type="button" className={styles.skip} onClick={finish}>Skip intro</button>
    </div>
  );
}
