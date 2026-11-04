import { getAudioContext, playSound } from "@/lib/sound-engine";

// Public notification asset used by davemiye.com.
export const MESSAGE_SOUND = "/sounds/message-popin.mp3";

export function playMessagePop() {
  if (typeof window === "undefined") return;
  try {
    const context = getAudioContext();
    if (context.state !== "running" && !navigator.userActivation?.hasBeenActive) return;
    void playSound(MESSAGE_SOUND, { volume: 0.18, interrupt: true }).catch(() => undefined);
  } catch {
    // The conversation still works when audio isn't available.
  }
}
