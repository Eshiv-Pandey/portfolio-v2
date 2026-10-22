export type CursorMode = "wild" | "classic";

export const CURSOR_MODE_EVENT = "portfolio:cursor-mode-change";

// Start everyone on the blue cloud; the truck can still save a new choice.
const STORAGE_KEY = "portfolio-cursor-mode-v2";
let fallbackMode: CursorMode = "wild";

export function getCursorMode(): CursorMode {
  if (typeof window === "undefined") return "wild";

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "classic" ? "classic" : "wild";
  } catch {
    return fallbackMode;
  }
}

export function subscribeCursorMode(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };

  window.addEventListener(CURSOR_MODE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CURSOR_MODE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function toggleCursorMode() {
  const mode: CursorMode = getCursorMode() === "wild" ? "classic" : "wild";
  fallbackMode = mode;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // The secret switch still works when browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent<CursorMode>(CURSOR_MODE_EVENT, { detail: mode }));
  return mode;
}
