"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * The Content Studio UI. It talks only to `/api/studio`, which exists only in
 * development — so this whole screen is a local tool for editing the site's
 * JSON data files through a form instead of by hand. Save writes the file on
 * disk; you then review the diff and commit.
 *
 * The editor is a validated JSON pane per collection rather than a field-by-
 * field form: it round-trips every shape the data files use without a bespoke
 * form for each, and it refuses to save until the text parses, so a slip can
 * never write a broken file.
 */

type CollectionMeta = { label: string; file: string; description: string };
type StudioPayload = {
  meta: Record<string, CollectionMeta>;
  data: Record<string, unknown[]>;
};

const PANEL =
  "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]";

export function StudioClient() {
  const [payload, setPayload] = useState<StudioPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  // Draft text and the last-saved text, per collection, so we can show a dirty
  // state and offer a clean revert without another round-trip.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/studio", { cache: "no-store" });
      if (!res.ok) throw new Error(`Studio API returned ${res.status}`);
      const json = (await res.json()) as StudioPayload;
      const text: Record<string, string> = {};
      for (const [key, rows] of Object.entries(json.data)) {
        text[key] = `${JSON.stringify(rows, null, 2)}\n`;
      }
      setPayload(json);
      setDraft(text);
      setSaved(text);
      setActive((prev) => prev ?? Object.keys(json.meta)[0] ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const parseError = useMemo(() => {
    if (!active) return null;
    const text = draft[active];
    if (text === undefined) return null;
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return "Top level must be an array.";
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Invalid JSON.";
    }
  }, [active, draft]);

  const isDirty = active ? draft[active] !== saved[active] : false;

  const save = useCallback(async () => {
    if (!active || parseError) return;
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch("/api/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: active,
          data: JSON.parse(draft[active]),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Save failed (${res.status})`);
      // Normalise to exactly what was written so the dirty flag clears.
      const normalised = `${JSON.stringify(JSON.parse(draft[active]), null, 2)}\n`;
      setDraft((d) => ({ ...d, [active]: normalised }));
      setSaved((s) => ({ ...s, [active]: normalised }));
      setFlash(`Saved ${json.count} rows to ${payload?.meta[active]?.file}.`);
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [active, draft, parseError, payload]);

  const keys = payload ? Object.keys(payload.meta) : [];
  const activeMeta = active ? payload?.meta[active] : undefined;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 text-zinc-800 dark:text-zinc-200">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Content Studio
          </h1>
          <span className="rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            dev only
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Edits write the JSON data files in this repo on your machine. Review
          the diff and commit to publish — nothing here reaches the deployed
          site, which ships without this screen.
        </p>
      </header>

      {loadError && (
        <div className={`${PANEL} mb-6 p-4 text-[13px] text-rose-600 dark:text-rose-400`}>
          Couldn&apos;t load the Studio: {loadError}
          <button
            type="button"
            onClick={load}
            className="ml-2 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {payload && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {keys.map((key) => {
              const dirty = draft[key] !== saved[key];
              const on = key === active;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    on
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  {payload.meta[key].label}
                  {dirty && (
                    <span
                      aria-label="unsaved changes"
                      className="ml-1.5 inline-block size-1.5 rounded-full bg-amber-400 align-middle"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {active && (
            <div className={`${PANEL} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {activeMeta?.file}
                  </p>
                  <p className="truncate text-[12px] text-zinc-500 dark:text-zinc-400">
                    {activeMeta?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, [active]: saved[active] }))
                    }
                    disabled={!isDirty || saving}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    Revert
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!isDirty || !!parseError || saving}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              <textarea
                spellCheck={false}
                value={draft[active] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [active]: e.target.value }))
                }
                className="block h-[60vh] w-full resize-y bg-transparent p-4 font-mono text-[12.5px] leading-relaxed text-zinc-800 outline-none dark:text-zinc-200"
              />

              <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2.5 text-[12px] dark:border-zinc-800">
                <span
                  className={
                    parseError
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                >
                  {parseError ? `Invalid: ${parseError}` : "Valid JSON"}
                </span>
                {flash && (
                  <span className="truncate text-zinc-500 dark:text-zinc-400">
                    {flash}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
