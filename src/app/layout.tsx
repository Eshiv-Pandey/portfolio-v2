import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OpeningWindow } from "@/components/OpeningWindow";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL as SITE_URL_CONST,
  TITLE_TEMPLATE,
} from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Carries the Devanagari micro-headings that sit beside each section title.
 * Only the weights actually used are requested — this font is decorative and
 * shouldn't cost more than a few KB.
 */
const notoDevanagari = Noto_Sans_Devanagari({
  // The Tailwind theme key is `--font-devanagari` (see globals.css); next/font
  // owns a separate variable so the theme mapping isn't self-referential.
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = SITE_URL_CONST;

const TITLE = SITE_NAME;
const DESCRIPTION = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DESCRIPTION,
  keywords: [
    "Eshiv Pandey",
    "full stack developer",
    "open source",
    "CNCF",
    "HAMi",
    "Next.js",
    "Go",
    "C++",
    "New Delhi",
  ],
  authors: [{ name: "Eshiv Pandey", url: SITE_URL }],
  creator: "Eshiv Pandey",
  // No `icons` key: favicon.ico / icon.png / apple-icon.png sit in this
  // directory, and Next emits the <link> tags from those file conventions.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: TITLE,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col dark:bg-black dark:text-zinc-50 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {/* Last in the body so it paints over everything without needing to
            out-stack each component's own z-index one at a time. */}
        <OpeningWindow />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
