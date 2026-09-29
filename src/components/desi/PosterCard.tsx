/**
 * PosterCard — generated cover art in the language of ref3.
 *
 * Some things worth showing have no screenshot: an org membership, a hackathon
 * win, a database engine with no UI. The alternative to a real image is either
 * a grey placeholder or a fake screenshot; this is neither. It rebuilds ref3's
 * poster — rose rim, teal ground, scalloped marigold cartouche — in vector, so
 * it stays sharp at any size and carries the same accent palette as the rest of
 * the page.
 */

/** The cartouche outline: arched top and bottom with a pinch at mid-height on
 *  each side. Traced from ref3's yellow panel, in a 200×120 box. */
const CARTOUCHE =
  "M100 6C130 6 150 10 168 18C180 24 194 32 194 44C194 52 186 58 186 60C186 62 194 68 194 76C194 88 180 96 168 102C150 110 130 114 100 114C70 114 50 110 32 102C20 96 6 88 6 76C6 68 14 62 14 60C14 58 6 52 6 44C6 32 20 24 32 18C50 10 70 6 100 6Z";

/** One corner scroll, rotated into each of the four corners. */
const CORNERS = [
  "top-1 left-1",
  "top-1 right-1 rotate-90",
  "right-1 bottom-1 rotate-180",
  "bottom-1 left-1 -rotate-90",
];

function CornerScroll({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={`absolute size-7 ${className}`}
      fill="none"
      stroke="var(--desi-indigo)"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M2 30C2 14 14 2 30 2" />
      <path d="M8 30C8 19 19 8 30 8" />
      <path d="M14 26c0-6 6-12 12-12" opacity="0.75" />
    </svg>
  );
}

type Props = {
  title: string;
  /** Small all-caps line above the title, inside the cartouche. */
  eyebrow?: string;
  className?: string;
};

export function PosterCard({ title, eyebrow, className = "" }: Props) {
  return (
    // The root is the rose rim; the teal panel sits inside it, so the dotted
    // stripe only ever shows in the 7px margin.
    <div
      className={`relative size-full overflow-hidden p-[7px] ${className}`}
      style={{ backgroundColor: "var(--desi-rose)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 0.8px, transparent 0.9px)",
          backgroundSize: "7px 7px",
        }}
      />

      <div
        className="relative size-full overflow-hidden"
        style={{ backgroundColor: "var(--desi-teal)" }}
      >
        {/* Ground texture — ref1's jaali at a whisper, so the teal isn't flat. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: "url('/patterns/ref1.webp')",
            backgroundSize: "180px",
          }}
        />

        {CORNERS.map((c) => (
          <CornerScroll key={c} className={c} />
        ))}

        {/* Cartouche + copy */}
        <div className="absolute inset-0 grid place-items-center p-3">
          <div className="relative w-[92%]">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 120"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
            >
              <path
                d={CARTOUCHE}
                fill="var(--desi-marigold)"
                stroke="var(--desi-rose)"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* The little diamond ornaments top and bottom centre. */}
            {["-top-[3px]", "-bottom-[3px]"].map((pos) => (
              <span
                key={pos}
                aria-hidden="true"
                className={`absolute ${pos} left-1/2 size-[7px] -translate-x-1/2 rotate-45`}
                style={{ backgroundColor: "var(--desi-teal)" }}
              />
            ))}

            <div className="relative flex flex-col items-center gap-1 px-7 py-5 text-center">
              {eyebrow && (
                <span
                  className="text-[9px] leading-none font-bold tracking-[0.18em] uppercase"
                  style={{ color: "var(--desi-maroon)" }}
                >
                  {eyebrow}
                </span>
              )}
              <span
                className="font-heading line-clamp-3 text-[13px] leading-[1.25] font-black tracking-tight text-balance"
                style={{ color: "var(--desi-indigo)" }}
              >
                {title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosterCard;
