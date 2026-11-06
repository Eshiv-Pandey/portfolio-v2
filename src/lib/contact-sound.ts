import { getAudioContext } from "@/lib/sound-engine";

const PREFERENCE_KEY = "portfolio:message-sound";
const PREFERENCE_EVENT = "portfolio:message-sound-change";
const activeTones = new Set<OscillatorNode>();
let soundEnabled = true;

export function isMessageSoundEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const saved = window.localStorage.getItem(PREFERENCE_KEY);
    return saved === null ? soundEnabled : saved !== "off";
  } catch {
    return soundEnabled;
  }
}

export function subscribeToMessageSound(listener: () => void) {
  window.addEventListener(PREFERENCE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function setMessageSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try { window.localStorage.setItem(PREFERENCE_KEY, enabled ? "on" : "off"); } catch { /* Keep the session preference. */ }
  if (!enabled) {
    for (const tone of activeTones) {
      try { tone.stop(); } catch { /* Already ended. */ }
    }
    activeTones.clear();
  }
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export async function unlockMessageAudio() {
  if (typeof window === "undefined" || !isMessageSoundEnabled()) return;
  try { await getAudioContext().resume(); } catch { /* Audio is optional. */ }
}

export function playMessagePop() {
  if (typeof window === "undefined" || !isMessageSoundEnabled() || document.hidden) return;
  try {
    const context = getAudioContext();
    if (context.state !== "running") return;

    // Original, short two-note chime. Synthesis avoids an audio download and
    // starts in sync with the bubble instead of waiting for an MP3 to decode.
    const start = context.currentTime + 0.005;
    for (const [frequency, offset] of [[880, 0], [1320, 0.11]]) {
      for (const [harmonic, volume] of [[1, 0.12], [2, 0.018]]) {
        const tone = context.createOscillator();
        const gain = context.createGain();
        const at = start + offset;
        tone.type = "sine";
        tone.frequency.setValueAtTime(frequency * harmonic * 1.08, at);
        tone.frequency.exponentialRampToValueAtTime(frequency * harmonic, at + 0.06);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
        tone.connect(gain);
        gain.connect(context.destination);
        tone.onended = () => {
          tone.disconnect();
          gain.disconnect();
          activeTones.delete(tone);
        };
        activeTones.add(tone);
        tone.start(at);
        tone.stop(at + 0.19);
      }
    }
  } catch {
    // The conversation still works when audio isn't available.
  }
}
