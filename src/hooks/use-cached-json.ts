"use client";

import { useEffect, useRef, useState } from "react";

interface CachedJsonState<T> {
  data: T | null;
  /** True only until *something* is on screen — cache counts. */
  loading: boolean;
  error: string | null;
}

/**
 * Fetch JSON, painting last visit's copy instantly while the fresh one loads.
 *
 * The API routes behind these calls are already revalidated server-side, so
 * this cache isn't about sparing the upstream — it's about the heatmaps not
 * flashing an empty grid on every navigation.
 *
 * `version` busts every stored entry at once when a payload shape changes;
 * bump it rather than hand-editing localStorage.
 */
export function useCachedJson<T>(
  url: string,
  cacheKey: string,
  version = "v1"
): CachedJsonState<T> {
  const [state, setState] = useState<CachedJsonState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const storageKey = `${cacheKey}:${version}`;
    let cancelled = false;

    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        setState({ data: JSON.parse(cached) as T, loading: false, error: null });
      }
    } catch {
      // Private mode, quota, or a stale shape — fall through to the network.
    }

    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = (await response.json()) as T;
        if (cancelled) return;

        setState({ data, loading: false, error: null });

        try {
          window.localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // Exceeding quota shouldn't break the render.
        }
      } catch (error) {
        if (cancelled) return;
        // Keep whatever the cache gave us; only surface an error if it gave
        // us nothing.
        setState((previous) =>
          previous.data
            ? { ...previous, loading: false }
            : {
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : "Request failed",
              }
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, cacheKey, version]);

  return state;
}
