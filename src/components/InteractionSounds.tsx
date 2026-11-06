"use client";

import { useEffect } from "react";
import { decodeAudioData, playSound } from "@/lib/sound-engine";

export const CLICK_SOUND = "/sounds/photo-change.mp3";
export const THEME_SOUND = "/sounds/toggle.mp3";

export function InteractionSounds() {
  useEffect(() => {
    for (const sound of [CLICK_SOUND, THEME_SOUND]) {
      void decodeAudioData(sound).catch(() => undefined);
    }

    const click = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      // Theme controls play their own distinct sound, once per activation.
      if (target?.closest('[data-sound="theme"], [data-sound="contact"]')) return;
      void playSound(CLICK_SOUND, { volume: 0.3, interrupt: true }).catch(() => undefined);
    };

    document.addEventListener("click", click, { capture: true });
    return () => document.removeEventListener("click", click, { capture: true });
  }, []);

  return null;
}
