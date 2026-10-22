"use client";

import Image from "next/image";

import { DashedRule } from "@/components/desi/section";
import { toggleCursorMode } from "@/lib/cursor-mode";

/**
 * A truck-art lorry ambling across a band, trailing exhaust.
 *
 * The lorry is `truck.png` with its painted backdrop keyed out (see
 * scripts/make-truck.mjs). It has two homes in mind: standing alone on the
 * site's own dashed drafting hairline — so the blueprint's guide line becomes
 * the road rather than a picture of a road being bolted onto a blueprint — or,
 * as the footer uses it, driving along the base of <MonumentSkyline> where the
 * ground is already drawn.
 *
 * All four motions are CSS, defined in globals.css and switched off together
 * by the reduced-motion block there:
 *
 *   .truck-drive   the track crossing the band, carrying everything with it
 *   .truck-jounce  suspension, on its own element because both are transforms
 *   .smoke-puff    exhaust, siblings of the jounce so the puffs don't bounce
 *
 * The truck is pinned to the *left edge* of a full-width track, which is what
 * lets `translateX(100%)` in the keyframes resolve against the band's width and
 * make the travel exactly band + truck — no dead seconds with the truck parked
 * out of sight. Moving the track rather than the truck also keeps the whole
 * thing on one compositor layer.
 *
 * Every size here — jounce, smoke drift, puff radius, blur — is a fraction of
 * `--truck-w`, so one `width` prop rescales the lorry and its plume together.
 * That is what lets the footer pass a percentage and get a truck that tracks
 * the skyline at every viewport instead of towering over it on a phone.
 */

/**
 * Negative delays, so the exhaust is already a stream on the first frame
 * instead of building up one puff at a time. Evenly spread across the 2.7s
 * puff cycle.
 */
const PUFF_DELAYS = [0, -540, -1080, -1620, -2160];

export function TruckRoad({
  className = "",
  width = "clamp(132px, 16vw, 248px)",
  duration = "26s",
  road = false,
  toggleCursor = false,
}: {
  className?: string;
  /**
   * Any CSS width. A percentage resolves against the band, which is how the
   * footer keeps the truck in proportion to the skyline behind it.
   */
  width?: string;
  duration?: string;
  /** Draw the dashed hairline for the truck to drive on. */
  road?: boolean;
  /** Turn the moving lorry into the site's secret cursor-mode switch. */
  toggleCursor?: boolean;
}) {
  return (
    <div
      aria-hidden={toggleCursor ? undefined : true}
      className={`pointer-events-none relative overflow-hidden ${className}`}
      style={
        {
          "--truck-w": width,
          // Slow enough to be scenery rather than a distraction: roughly
          // 55px/s on a desktop-width band.
          "--truck-duration": duration,
        } as React.CSSProperties
      }
    >
      {road && <DashedRule position="bottom" nodes="edge" />}

      <div className="truck-drive absolute inset-0">
        {/* The keyed crop is 570x328, so the aspect ratio sets the height and
            the caller only ever has to think about width. */}
        <div className="absolute bottom-0 left-0 aspect-570/328 w-(--truck-w)">
          {toggleCursor && (
            <button
              type="button"
              data-cursor-ignore
              aria-label="Toggle cursor effect"
              className="pointer-events-auto absolute inset-0 z-30 cursor-pointer rounded-sm border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d8ff00] focus-visible:ring-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                toggleCursorMode();
              }}
            />
          )}

          {/* Contact shadow. Outside the jounce, so the truck moves against
              the ground rather than dragging it along. */}
          <span className="absolute inset-x-[7%] bottom-0 h-[3.5%] rounded-[50%] bg-black/25 blur-[3px] dark:bg-black/60" />

          {/* Exhaust leaves from the rear-left, under the bed — the truck
              faces right. The keyframes drift each puff back and up while the
              truck carries on forward, so they read as being left behind. */}
          {PUFF_DELAYS.map((delay) => (
            <span
              key={delay}
              className="smoke-puff absolute bottom-[13%] left-[4%] aspect-square w-[7.5%] rounded-full bg-zinc-400/80 blur-xs dark:bg-zinc-500/70"
              style={{ "--puff-delay": `${delay}ms` } as React.CSSProperties}
            />
          ))}

          <div className="truck-jounce relative size-full">
            <Image
              src="/images/truck-art.webp"
              alt=""
              fill
              sizes="248px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
