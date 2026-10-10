import { CountUp } from "@/components/CountUp";

/**
 * The stack, as four marquee rows.
 *
 * Ported from the tech-stack section of the previous portfolio: stat tiles above
 * four category tracks that scroll in alternating directions, each chip a brand
 * mark plus a name, with the row edges faded into the page so chips arrive and
 * leave rather than popping at a hard boundary.
 *
 * Two deliberate departures from that original, which was dark-only:
 *
 * - The category accents use this site's desi tokens rather than the old
 *   violet/cyan/green/amber set, so the section reads as part of this page.
 * - Brand hexes are tuned for *both* themes. simpleicons serves one colour per
 *   request, and several canonical brand colours fail at one end — JavaScript
 *   yellow and React cyan vanish on white, Pandas navy on black — so those are
 *   nudged to a mid-tone, and the monochrome marks (Next.js, Express, GitHub)
 *   render neutral zinc instead of the white they used on the old dark canvas.
 */

interface Tech {
  name: string;
  /** simpleicons slug. Omitted where the CDN has no mark — see `skills` note. */
  icon?: string;
  /** Tuned for legibility on both white and near-black. */
  color?: string;
}

interface Category {
  label: string;
  /** A desi token, so the accents track the theme. */
  accent: string;
  direction: "left" | "right";
  items: Tech[];
}

const CATEGORIES: Category[] = [
  {
    label: "Languages & Core",
    accent: "var(--desi-marigold)",
    direction: "left",
    items: [
      { name: "JavaScript", icon: "javascript", color: "#d4b800" },
      { name: "TypeScript", icon: "typescript", color: "#3178c6" },
      { name: "Go", icon: "go", color: "#00add8" },
      { name: "Python", icon: "python", color: "#3776ab" },
      { name: "C++", icon: "cplusplus", color: "#00599c" },
      { name: "SQL" },
    ],
  },
  {
    label: "Frameworks & Libraries",
    accent: "var(--desi-indigo)",
    direction: "right",
    items: [
      { name: "React", icon: "react", color: "#2aa9cc" },
      { name: "Next.js", icon: "nextdotjs", color: "#71717a" },
      { name: "Node.js", icon: "nodedotjs", color: "#539e43" },
      { name: "Express", icon: "express", color: "#71717a" },
      { name: "Tailwind", icon: "tailwindcss", color: "#06b6d4" },
      { name: "EJS", icon: "ejs", color: "#a91e50" },
      { name: "GraphQL", icon: "graphql", color: "#e10098" },
    ],
  },
  {
    label: "AI / ML & Data",
    accent: "var(--desi-teal)",
    direction: "left",
    items: [
      { name: "TensorFlow", icon: "tensorflow", color: "#ff6f00" },
      { name: "PyTorch", icon: "pytorch", color: "#ee4c2c" },
      { name: "scikit-learn", icon: "scikitlearn", color: "#f7931e" },
      { name: "Pandas", icon: "pandas", color: "#5b4ddb" },
      { name: "NumPy", icon: "numpy", color: "#3f86a8" },
      { name: "Matplotlib" },
    ],
  },
  {
    label: "Cloud, DevOps & Databases",
    accent: "var(--desi-rose)",
    direction: "right",
    items: [
      { name: "AWS" },
      { name: "Docker", icon: "docker", color: "#2496ed" },
      { name: "Kubernetes", icon: "kubernetes", color: "#326ce5" },
      { name: "Git", icon: "git", color: "#f05032" },
      { name: "GitHub", icon: "github", color: "#71717a" },
      { name: "PostgreSQL", icon: "postgresql", color: "#4169e1" },
      { name: "MongoDB", icon: "mongodb", color: "#47a248" },
      { name: "DynamoDB" },
      { name: "Redis", icon: "redis", color: "#ff4438" },
      { name: "Supabase", icon: "supabase", color: "#3ecf8e" },
    ],
  },
];

const TECH_COUNT = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

/**
 * The first two are counted from the data above. The second two are carried
 * over from the old site's own tiles — they're claims about Eshiv, not anything
 * derivable from this repo, so edit them here when they change.
 */
const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: TECH_COUNT, label: "Technologies" },
  { value: CATEGORIES.length, label: "Categories" },
  { value: 2, suffix: "+", label: "Years Coding" },
  { value: 10, suffix: "+", label: "Projects Built" },
];

/** How many times each track repeats its items to loop seamlessly. */
const REPEATS = 3;

function TechChip({ tech, accent }: { tech: Tech; accent: string }) {
  const tint = tech.color ?? accent;

  return (
    <div className="group relative flex shrink-0 cursor-default items-center gap-2.5 rounded-xl border border-black/10 bg-zinc-50 px-4 py-2.5 select-none dark:border-white/[0.08] dark:bg-white/[0.03]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 50%, color-mix(in srgb, ${tint} 18%, transparent) 0%, transparent 70%)`,
        }}
      />

      {tech.icon ? (
        // A one-pixel CDN mark, not worth a next/image round trip.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${tech.icon}/${tech.color!.slice(1)}`}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          decoding="async"
          className="relative z-10 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-125"
        />
      ) : (
        <span
          aria-hidden="true"
          className="relative z-10 size-[11px] shrink-0 rotate-45 rounded-[1px] opacity-80 transition-transform duration-300 group-hover:scale-125"
          style={{ backgroundColor: accent }}
        />
      )}

      <span className="relative z-10 text-[13px] font-medium whitespace-nowrap text-zinc-600 transition-colors duration-300 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
        {tech.name}
      </span>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const { label, accent, direction, items } = category;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 px-1">
        <span
          aria-hidden="true"
          className="size-[7px] shrink-0 rotate-45 rounded-[1px]"
          style={{ backgroundColor: accent }}
        />
        <p
          className="text-[10px] font-medium tracking-[0.3em] uppercase"
          style={{ color: accent }}
        >
          {label}
        </p>
        <div
          aria-hidden="true"
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${accent} 35%, transparent), transparent)`,
          }}
        />
      </div>

      <div className="relative overflow-hidden">
        {/* Chips fade into the page at both ends rather than clipping. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20 dark:from-black"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20 dark:from-black"
        />

        <div
          className={`flex w-max gap-3 ${
            direction === "left" ? "tech-track-left" : "tech-track-right"
          }`}
        >
          {Array.from({ length: REPEATS }, (_, copy) => (
            <div
              key={copy}
              className="flex gap-3"
              // Copies past the first are the same words again — read once.
              {...(copy > 0 ? { "aria-hidden": "true" } : {})}
            >
              {items.map((tech) => (
                <TechChip key={tech.name} tech={tech} accent={accent} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TechStack() {
  return (
    <div className="pt-6 pb-2">
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-black/10 bg-zinc-50 py-4 text-center transition-colors duration-300 hover:border-black/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.15]"
          >
            <p className="text-2xl font-bold text-zinc-900 md:text-3xl dark:text-zinc-100">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-0.5 text-[10px] tracking-widest text-zinc-500 uppercase dark:text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {CATEGORIES.map((category) => (
          <CategoryRow key={category.label} category={category} />
        ))}
      </div>
    </div>
  );
}
