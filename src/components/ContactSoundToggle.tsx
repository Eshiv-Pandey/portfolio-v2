"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMessageSoundEnabled, playMessagePop, setMessageSoundEnabled, subscribeToMessageSound, unlockMessageAudio } from "@/lib/contact-sound";
import styles from "@/app/contact/contact.module.css";

export function ContactSoundToggle() {
  const enabled = useSyncExternalStore(subscribeToMessageSound, isMessageSoundEnabled, () => true);

  return (
    <button
      type="button"
      className={styles.soundToggle}
      data-sound="contact"
      aria-label="Message sounds"
      aria-pressed={enabled}
      title={enabled ? "Mute message sounds" : "Enable message sounds"}
      onClick={async () => {
        setMessageSoundEnabled(!enabled);
        if (!enabled) {
          await unlockMessageAudio();
          playMessagePop();
        }
      }}
    >
      {enabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
    </button>
  );
}
