import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NameSignature } from "@/components/NameSignature";
import { SocialLinks } from "@/components/SocialLinks";

import { MonumentSkyline } from "@/components/desi/MonumentSkyline";
import { NebulaBackground } from "@/components/NebulaBackground";
import { TruckRoad } from "@/components/TruckRoad";
import { SITE_NAME } from "@/lib/site";
import styles from "./footer.module.css";

/**
 * The page footer, built from `public/images/footer.png` (the DHARAA card): a
 * cream card on a terracotta board, opening with the handwritten name,
 * two essential link columns, closing on the monument skyline.
 *
 * It is deliberately compact and monochrome — the terracotta/cream palette of
 * the reference, with plain hairline rules rather than coloured dividers, so it
 * reads as one clean object. The one motion the site adds over the still
 * reference is the truck-art lorry driving along the skyline's ground line.
 *
 * Colours come from the `--fx-*` block in globals.css; <MonumentSkyline> reads
 * the same tokens so the band and the card can never drift apart.
 */

const EMAIL = "eshivpandey18@gmail.com";
const PHONE = "+91 82796 28207";
const PHONE_HREF = "tel:+918279628207";

const PAGES = [
  { name: "Projects", href: "/projects" },
  { name: "Experience", href: "/experience" },
  { name: "Pull Requests", href: "/pull-requests" },
  { name: "Contact", href: "/contact" },
];

const INK = { color: "var(--fx-ink)" };
const MUTED = { color: "var(--fx-muted)" };

const LINK_CLASS =
  "inline-block text-[12px] leading-[1.85] transition-colors hover:underline hover:underline-offset-4";

/** A plain column heading — dark ink, bold, as the reference draws them. */
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-bold tracking-tight" style={INK}>
      {children}
    </p>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Heading>{title}</Heading>
      <ul className="mt-2 space-y-0.5">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="relative mt-10 ml-[calc(var(--gutter)_*_-1_-_1rem)] w-screen p-2 sm:p-3"
      style={{
        backgroundColor: "var(--fx-frame)",
        boxShadow: "inset 0 0 0 1px var(--fx-frame-edge)",
      }}
    >
      <div className="relative overflow-hidden rounded-[14px]" style={{ backgroundColor: "var(--fx-card)" }}>
        {/* Animated nebula standing in for the flat board colour, with a veil
            of the card tone over it so the ink keeps its contrast. Both layers
            sit behind the content (`relative z-10`). */}
        <NebulaBackground />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: "color-mix(in srgb, var(--fx-card) 42%, transparent)" }}
        />
        <div className={styles.content}>
          {/* Masthead — logo + wordmark. */}
          <div className={styles.brand}>
            <div className="max-w-[42ch]">
              <Link href="/" aria-label="Eshiv Pandey home" className="flex w-fit items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--fx-accent)">
                <NameSignature animated={false} className="h-auto w-[280px] max-w-full text-(--fx-ink)" />
                <span className="sr-only">{SITE_NAME}</span>
              </Link>
            </div>
          </div>

          {/* Link columns */}
          <div className={styles.columns}>
            <Column title="Quick Links">
              {PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={LINK_CLASS} style={MUTED}>
                    {page.name}
                  </Link>
                </li>
              ))}
            </Column>

            <div>
              <Heading>Connect With Me</Heading>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-start gap-2 text-[12px] leading-snug transition-colors hover:underline hover:underline-offset-4"
                    style={MUTED}
                  >
                    <Mail className="mt-px size-3.5 shrink-0" />
                    <span className="min-w-0 break-words">{EMAIL.split("@")[0]}<wbr />@{EMAIL.split("@")[1]}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={PHONE_HREF}
                    className="flex items-center gap-2 text-[12px] transition-colors hover:underline hover:underline-offset-4"
                    style={MUTED}
                  >
                    <Phone className="size-3.5 shrink-0" />
                    {PHONE}
                  </a>
                </li>
                <li className="flex items-center gap-2 text-[12px]" style={MUTED}>
                  <MapPin className="size-3.5 shrink-0" />
                  New Delhi, India
                </li>
              </ul>
            </div>
            <SocialLinks className={styles.socials} />
          </div>
        </div>

        {/* The monument band the footer ends on, with the lorry driving along
            the skyline's own ground line. The truck layer is wrapped in its own
            absolute overlay rather than being handed `absolute` directly:
            <TruckRoad> is `position: relative` for its inner track, so passing
            `absolute` collided and parked it below the skyline at zero height.
            The overlay takes the skyline's box; the truck fills it with
            `size-full`. */}
        <div className="relative z-10">
          <MonumentSkyline />
          <div className="absolute inset-0">
            <TruckRoad className="size-full" width="15%" duration="14s" />
          </div>
        </div>
      </div>
    </footer>
  );
}
