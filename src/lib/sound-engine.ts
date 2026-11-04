let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer>>();
const activeSources = new Map<string, AudioBufferSourceNode>();

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function decodeAudioData(url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const ctx = getAudioContext();
  const pending = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((bytes) => ctx.decodeAudioData(bytes))
    .catch((error) => {
      bufferCache.delete(url);
      throw error;
    });
  bufferCache.set(url, pending);
  return pending;
}

export interface PlaySoundOptions {
  volume?: number;
  playbackRate?: number;
  onEnd?: () => void;
  interrupt?: boolean;
}

export interface SoundPlayback {
  stop: () => void;
}

export async function playSound(
  url: string,
  options: PlaySoundOptions = {}
): Promise<SoundPlayback> {
  const { volume = 1, playbackRate = 1, onEnd, interrupt = false } = options;
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const buffer = await decodeAudioData(url);
  if (interrupt) {
    try { activeSources.get(url)?.stop(); } catch { /* Already ended. */ }
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = Math.max(0, Math.min(1, volume));

  source.connect(gain);
  gain.connect(ctx.destination);

  source.onended = () => {
    source.disconnect();
    gain.disconnect();
    if (activeSources.get(url) === source) activeSources.delete(url);
    onEnd?.();
  };

  if (interrupt) activeSources.set(url, source);
  source.start(0);

  return {
    stop: () => {
      try {
        source.stop();
      } catch {
        // No-op if already stopped.
      }
    },
  };
}
