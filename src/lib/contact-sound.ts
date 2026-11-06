import { decodeAudioData, getAudioContext } from "@/lib/sound-engine";

export const MESSAGE_SOUND = "/sounds/mixkit-software-interface-start-2574.wav";

const PREFERENCE_KEY = "portfolio:message-sound";
const PREFERENCE_EVENT = "portfolio:message-sound-change";
let activeMessage: AudioBufferSourceNode | null = null;
let playbackVersion = 0;
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
    playbackVersion += 1;
    try { activeMessage?.stop(); } catch { /* Already ended. */ }
    activeMessage = null;
  }
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export async function unlockMessageAudio() {
  if (typeof window === "undefined" || !isMessageSoundEnabled()) return;
  try { await Promise.all([getAudioContext().resume(), decodeAudioData(MESSAGE_SOUND)]); } catch { /* Audio is optional. */ }
}

export async function prepareMessageSound() {
  if (typeof window === "undefined") return;
  try { await decodeAudioData(MESSAGE_SOUND); } catch { /* Audio is optional. */ }
}

export async function playMessagePop() {
  if (typeof window === "undefined" || !isMessageSoundEnabled() || document.hidden) return;
  try {
    const context = getAudioContext();
    if (context.state !== "running") return;
    const version = ++playbackVersion;
    const buffer = await decodeAudioData(MESSAGE_SOUND);
    if (version !== playbackVersion || !isMessageSoundEnabled() || document.hidden || context.state !== "running") return;

    // Only the latest message plays, including when loading a sound slowly.
    try { activeMessage?.stop(); } catch { /* Already ended. */ }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.3;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (activeMessage === source) activeMessage = null;
    };
    activeMessage = source;
    source.start(0);
  } catch {
    // The conversation still works when audio isn't available.
  }
}
