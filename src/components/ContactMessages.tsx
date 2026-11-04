"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { INTRO_FINISHED_EVENT } from "@/lib/intro";
import { MESSAGE_SOUND, playMessagePop } from "@/lib/contact-sound";
import { decodeAudioData, getAudioContext } from "@/lib/sound-engine";
import styles from "@/app/contact/contact.module.css";

interface ContactMessagesProps {
  email: string;
  copyStatus: "idle" | "copied" | "error";
  onCopy: () => void;
  onComplete: (ready: boolean) => void;
}

export function ContactMessages({ email, copyStatus, onCopy, onComplete }: ContactMessagesProps) {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer = 0;
    let count = 0;
    let started = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void decodeAudioData(MESSAGE_SOUND).catch(() => undefined);

    const primeAudio = () => {
      try { void getAudioContext().resume().catch(() => undefined); } catch { /* Audio is optional. */ }
    };
    const next = () => {
      setTyping(true);
      timer = window.setTimeout(() => {
        count += 1;
        setTyping(false);
        setVisible(count);
        playMessagePop();
        if (count < 3) timer = window.setTimeout(next, 350);
        else onComplete(true);
      }, 750);
    };
    const start = () => {
      if (started) return;
      started = true;
      timer = window.setTimeout(() => {
        if (reduced) { setVisible(3); onComplete(true); }
        else next();
      }, reduced ? 0 : 200);
    };

    window.addEventListener(INTRO_FINISHED_EVENT, start);
    document.addEventListener("pointerdown", primeAudio, { once: true });
    document.addEventListener("keydown", primeAudio, { once: true });
    if (!document.querySelector("[data-name-intro]")) start();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(INTRO_FINISHED_EVENT, start);
      document.removeEventListener("pointerdown", primeAudio);
      document.removeEventListener("keydown", primeAudio);
    };
  }, [onComplete]);

  return (
    <div className={styles.conversation}>
      <ol className={styles.thread} aria-live="polite" aria-relevant="additions">
        {(visible > 0 || typing) && <li className={styles.group}>
          <Image src="/images/pic1.jpeg" alt="" width={32} height={32} className={styles.avatar} />
          <div className={styles.stack}>
            {visible >= 1 && <p className={`${styles.bubble} ${styles.arrival}`}>Hey, I&apos;m Eshiv.</p>}
            {visible >= 2 && <p className={`${styles.bubble} ${styles.arrival}`}>Got a project in mind? I&apos;d love to hear about it.</p>}
            {visible >= 3 && <div className={`${styles.emailBubble} ${styles.arrival}`}>
              <a href={`mailto:${email}`} aria-live="polite">{copyStatus === "copied" ? "Email copied." : copyStatus === "error" ? "Copy failed. Email me instead." : "Email me, or leave a note below."}</a>
              <button type="button" onClick={onCopy} className={styles.copy} aria-label={copyStatus === "copied" ? "Email copied" : "Copy email address"}>
                {copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              </button>
            </div>}
            {typing && <div className={styles.typing} role="status" aria-label="Eshiv is typing"><span /><span /><span /></div>}
          </div>
        </li>}
      </ol>
    </div>
  );
}
