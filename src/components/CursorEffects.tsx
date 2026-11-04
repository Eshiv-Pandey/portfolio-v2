"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { PixelTrail } from "@/components/PixelTrail";
import { WildCursor } from "@/components/WildCursor";
import {
  getCursorMode,
  subscribeCursorMode,
  type CursorMode,
} from "@/lib/cursor-mode";

const getServerCursorMode = (): CursorMode => "wild";

export function CursorEffects() {
  const pathname = usePathname();
  const mode = useSyncExternalStore(
    subscribeCursorMode,
    getCursorMode,
    getServerCursorMode,
  );

  if (pathname === "/contact") return null;

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {mode === "wild" ? "Pixel cloud cursor enabled" : "Classic cursor trail enabled"}
      </span>
      {mode === "wild" ? <WildCursor /> : <PixelTrail />}
    </>
  );
}
