import type { ComponentType } from "react";
import { Search } from "lucide-react";
import {
  SiCmake,
  SiCplusplus,
  SiDocker,
  SiDrizzle,
  SiFastapi,
  SiGithub,
  SiGo,
  SiKubernetes,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export type TechIcon = ComponentType<{ className?: string }>;

export type TechKey =
  | "next" | "react" | "ts" | "node" | "tailwind"
  | "cpp" | "cmake" | "docker" | "k8s" | "go"
  | "postgres" | "prisma" | "drizzle" | "redis" | "supabase"
  | "python" | "fastapi" | "rag" | "github";

/** A key resolves to an icon; an object renders as a text chip — for tools with
 *  no simple-icons mark (OpenRouter, ARIES, and friends). */
export type TechItem = TechKey | { label: string; tooltip?: string };

/** Drives the dot and label on each card. `building` is the honest default for
 *  something that runs locally but isn't deployed. */
export type ProjectStatus = "live" | "building" | "archived";

/** Presentation for each status, kept here so the grid card and the project
 *  page can't drift apart on what "building" looks like. */
export const statusMeta: Record<
  ProjectStatus,
  { dot: string; ping: string; text: string; label: string }
> = {
  live: {
    dot: "bg-emerald-500",
    ping: "bg-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Live",
  },
  building: {
    dot: "bg-amber-500",
    ping: "bg-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    label: "Building",
  },
  archived: {
    dot: "bg-zinc-400",
    ping: "bg-zinc-300",
    text: "text-zinc-500 dark:text-zinc-400",
    label: "Archived",
  },
};

export interface Project {
  slug: string;
  title: string;
  imageTitle: string;
  src: string;
  lightModeSrc?: string;
  video: string;
  description: string;
  tech: TechItem[];
  github: string;
  live: string;
  status: ProjectStatus;
  starsText?: string;
  /** Pattern wash that fades in behind the cover on hover — ref1/2/3/5. */
  backgroundImage?: string;
  hasPin: boolean;
}

export const iconMap: Record<TechKey, TechIcon> = {
  next: SiNextdotjs, react: SiReact, ts: SiTypescript, node: SiNodedotjs,
  tailwind: SiTailwindcss, cpp: SiCplusplus, cmake: SiCmake, docker: SiDocker,
  k8s: SiKubernetes, go: SiGo, postgres: SiPostgresql, prisma: SiPrisma,
  drizzle: SiDrizzle, redis: SiRedis, supabase: SiSupabase, python: SiPython,
  fastapi: SiFastapi, rag: Search, github: SiGithub,
};

export const techNames: Record<TechKey, string> = {
  next: "Next.js", react: "React", ts: "TypeScript", node: "Node.js",
  tailwind: "Tailwind CSS", cpp: "C++17", cmake: "CMake", docker: "Docker",
  k8s: "Kubernetes", go: "Go", postgres: "PostgreSQL", prisma: "Prisma",
  drizzle: "Drizzle ORM", redis: "Redis", supabase: "Supabase", python: "Python",
  fastapi: "FastAPI", rag: "RAG", github: "GitHub API",
};

export const projectsData: Project[] = [
  {
    slug: "keyv-db",
    title: "KeyV DB",
    imageTitle: "Storage Engine",
    src: "/project-image/keyv-db.png",
    video: "",
    description:
      "An ACID key-value store written from scratch in C++17: paged storage, B+Tree indexing, a write-ahead log, and ARIES-style crash recovery.",
    tech: [
      "cpp",
      "cmake",
      "docker",
      "ts",
      "node",
      { label: "B+Tree", tooltip: "B+Tree indexing over a paged store" },
      { label: "WAL", tooltip: "Write-ahead log with ARIES-style recovery" },
      { label: "2PL", tooltip: "Strict two-phase locking for isolation" },
    ],
    github: "https://github.com/Eshiv-Pandey/KeyV-DB",
    live: "",
    status: "building",
    backgroundImage: "/patterns/ref1.webp",
    hasPin: true,
  },
  {
    slug: "switch",
    title: "Switch",
    imageTitle: "Workspace",
    src: "/project-image/switch.png",
    video: "",
    description:
      "One workspace, any model. Switch LLMs mid-conversation while context, project memory, and a shared hivemind carry over.",
    tech: [
      "next",
      "ts",
      "tailwind",
      "postgres",
      "drizzle",
      { label: "OpenRouter", tooltip: "Free OpenRouter models, no API key" },
    ],
    github: "https://github.com/Eshiv-Pandey/Switch",
    live: "https://switch-one-navy.vercel.app",
    status: "live",
    backgroundImage: "/patterns/ref1.webp",
    hasPin: false,
  },
  {
    slug: "atrium",
    title: "Atrium",
    imageTitle: "Booking View",
    src: "/project-image/atrium.png",
    video: "",
    description:
      "Book the room, keep the room. A Go backend over Postgres with a TypeScript front end, containerised end to end.",
    tech: ["go", "ts", "react", "postgres", "docker"],
    github: "https://github.com/Eshiv-Pandey/Atrium",
    live: "https://atrium-web.onrender.com/",
    status: "live",
    backgroundImage: "/patterns/ref1.webp",
    hasPin: false,
  },
  {
    slug: "tragtion",
    title: "tRAGtion",
    imageTitle: "Retrieval Pipeline",
    src: "/project-image/tragtion.png",
    video: "",
    description:
      "An AI coding workspace with persistent RAG memory that keeps hold of your codebase, its architecture, and the decisions behind it.",
    tech: ["next", "ts", "tailwind", "prisma", "postgres", "rag"],
    github: "https://github.com/Eshiv-Pandey/tRAGtion",
    live: "",
    status: "building",
    backgroundImage: "/patterns/ref1.webp",
    hasPin: false,
  },
];
