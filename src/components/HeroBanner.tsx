import { BannerParticles } from "@/components/BannerParticles";
import { CurrentTime } from "@/components/CurrentTime";
import { NebulaBackground } from "@/components/NebulaBackground";
import { TruckRoad } from "@/components/TruckRoad";

/**
 * The banner cell at the top of the blueprint grid.
 *
 * Height defaults to 22vh — the value every page's grid lines are drawn at.
 * The home page passes a taller value to give the oversized profile photo room
 * to straddle the banner's bottom edge; callers that override it must move
 * their own grid lines to match.
 *
 * The banner shares the footer's look: the same animated <NebulaBackground>
 * shader fills the cell (a warm cream/marigold/teal haze in light mode, a deep
 * glow after dark), so the top and bottom of the page bookend on the same
 * motion. Over it drift the same marigold petals used across the site
 * (<BannerParticles>). Edge fades blend the cell into the blueprint gutters and
 * the truck-art lorry drives along the bottom edge.
 */
export function HeroBanner({ height = "22vh" }: { height?: string } = {}) {
  return (
    <div
      className="pointer-events-auto absolute top-0 right-0 left-0 z-30 overflow-hidden bg-white shadow-[0_4px_12px_rgba(2,6,23,0.04)] dark:bg-[#070b18] dark:shadow-[0_4px_12px_rgba(2,6,23,0.10)]"
      style={{ height }}
    >
      {/* Same nebula as the footer — theme-aware, so no dark-mode dim is needed
          the way the old video/image banner required. */}
      <NebulaBackground />

      {/* The marigold petals already used across the site, drifting over the
          nebula. Their canvas sits at z-[4], above the shader and below the
          fades. A denser count than the contact page — the banner is the one
          place a thick petal-fall reads as festive rather than busy. */}
      <BannerParticles count={90} />

      {/* Edge fades that blend the cell into the blueprint gutters. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-10 bg-gradient-to-t from-white/90 to-transparent dark:from-black/60 dark:to-transparent" />
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-20 w-8 bg-gradient-to-r from-white/90 to-transparent dark:from-black/50 dark:to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-20 w-8 bg-gradient-to-l from-white/90 to-transparent dark:from-black/50 dark:to-transparent" />

      {/* The lorry, ambling across the bottom of the banner above the fade. */}
      <div className="absolute inset-0 z-10">
        <TruckRoad className="size-full" width="8%" duration="18s" />
      </div>

      <div className="pointer-events-auto absolute right-2 bottom-3 z-20">
        <CurrentTime />
      </div>
    </div>
  );
}
