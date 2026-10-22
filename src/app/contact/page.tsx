"use client";

import React, { useState } from "react";
import { FooterBackground } from "@/components/FooterBackground";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrentTime } from "@/components/CurrentTime";
import { RightNavbar } from "@/components/RightNavbar";
import { FlightButton } from "@/components/FlightButton";
import DisplacementText from "@/components/DisplacementText";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";
import { BannerParticles } from "@/components/BannerParticles";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Feedback for the sender — without it a working submit looks identical to a
  // broken one (the form just clears), and a failure is invisible entirely.
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.message.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatus("idle");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/eshivpandey18@gmail.com",
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        }
      );

      // formsubmit returns 200 with `{ success: "true" | "false" }`, so an ok
      // status alone isn't enough — check the payload too.
      const result = await response.json().catch(() => null);
      const ok = response.ok && result?.success !== "false";

      if (ok) {
        form.reset();
        setFormData({ name: "", email: "", message: "" });
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black relative overflow-x-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{
        __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--autofill-text) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--autofill-bg) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        :root {
          --autofill-bg: white;
          --autofill-text: #171717;
        }
        .dark {
          --autofill-bg: black;
          --autofill-text: #fafafa;
        }
      `}} />
      <RightNavbar />

      {/* Blueprint Vertical Lines */}
      <div className="absolute top-0 bottom-0 left-(--gutter) w-0 border-r border-black/30 dark:border-white/[0.15] pointer-events-none hidden md:block" style={{ maskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)', WebkitMaskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)' }} />
      <div className="absolute top-0 bottom-0 right-(--gutter-r) w-0 border-r border-black/30 dark:border-white/[0.15] pointer-events-none hidden md:block" style={{ maskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)', WebkitMaskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)' }} />

      {/* Blueprint Horizontal Lines */}
      <div className="absolute left-0 right-0 top-[22vh] h-0 border-b border-black/30 dark:border-white/[0.15] pointer-events-none" style={{ maskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)', WebkitMaskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)' }} />
      <div className="absolute left-0 right-0 top-[calc(22vh+112px)] h-0 border-b border-black/30 dark:border-white/[0.15] pointer-events-none" style={{ maskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)', WebkitMaskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)' }} />

      {/* Grid Intersection Nodes */}
      {[
        { top: '22vh', left: 'var(--gutter)' },
        { top: '22vh', right: 'var(--gutter-r)' },
        { top: 'calc(22vh + 112px)', left: 'var(--gutter)' },
        { top: 'calc(22vh + 112px)', right: 'var(--gutter-r)' },
      ].map((pos, i) => (
        <div key={i} className="absolute w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] pointer-events-none z-10 hidden md:block"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            transform: `translate(${pos.right ? '50%' : '-50%'}, -50%)`
          }} />
      ))}

      {/* Cell 1: Banner — the dot matrix every other sub-page uses, with
          marigold petals drifting across it. */}
      <div className="absolute left-0 right-0 md:left-(--gutter) md:right-(--gutter-r) top-0 h-[22vh] -z-0 pointer-events-auto overflow-hidden">
        <FooterBackground />
        <BannerParticles />
        <div className="absolute bottom-3 right-2 z-10 pointer-events-auto">
          <CurrentTime />
        </div>
      </div>
      {/* Cell 2: Header with Back Button + Title + Controls */}
      <div className="absolute left-0 right-0 md:left-(--gutter) md:right-(--gutter-r) top-[22vh] h-[112px] flex items-center px-4 z-50">
        <div className="flex w-full items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="group flex items-center justify-center w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex flex-col justify-center">
              <h1 className="text-[20px] sm:text-[24px] font-bold text-zinc-800 dark:text-zinc-100 tracking-tight leading-none mb-0.5 [text-shadow:-1.5px_0_0_rgba(14,124,123,0.28),1.5px_0_0_rgba(233,162,8,0.38)] dark:[text-shadow:-1.5px_0_0_rgba(14,124,123,0.55),1.5px_0_0_rgba(233,162,8,0.6)]">
                Contact
              </h1>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Open for meaningful work.
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-start justify-end gap-2 sm:gap-3 h-20 sm:h-24 py-1">
            <CommandMenu />
            <ThemeToggle className="dark:text-zinc-400 hover:dark:text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="ml-0 mr-0 md:ml-(--gutter) md:mr-(--gutter-r) pt-[calc(22vh+112px)] pb-0 px-8 md:px-4 flex flex-col z-10 relative">
        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-12 -mx-8 space-y-10 md:-mx-4">
          {/* FormSubmit Configuration */}
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_subject" value="New Submission from Portfolio" />
          <input type="text" name="_honey" style={{ display: "none" }} />

          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-[0.15em] text-zinc-400 dark:text-zinc-600 uppercase ml-4">
              Full Name
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ada Lovelace"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-[0.15em] text-zinc-400 dark:text-zinc-600 uppercase ml-4">
              Email Address
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="ada@example.com"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-[0.15em] text-zinc-400 dark:text-zinc-600 uppercase ml-4">
              Message
            </label>
            <textarea
              required
              name="message"
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Saw your work on HAMi. Got a minute?"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700 resize-none"
            />
          </div>

          {/* FlightButton with airplane animation - wrapped in premium border */}
          <div className="flex justify-center w-full pt-4">
            <div className="relative group">
              <div className="absolute -inset-[5px] border border-black/5 dark:border-white/5 rounded-[11px] pointer-events-none transition-colors duration-300 group-hover:border-black/10 dark:group-hover:border-white/10" />
              <FlightButton
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="!relative !bg-zinc-50 dark:!bg-[#09090b] !border-black/5 dark:!border-white/5 !shadow-sm !shadow-black/20 dark:!shadow-lg dark:!shadow-black/80 !rounded-[6px] !px-4 !py-2 !text-[13px] !font-medium !transition-all !duration-300 hover:!bg-zinc-100 dark:hover:!bg-[#121214]"
              />
            </div>
          </div>

          {/* Send feedback — a reset alone reads as "nothing happened", and a
              failure was previously silent. */}
          {status !== "idle" && (
            <p
              role="status"
              aria-live="polite"
              className={`text-center text-[13px] ${
                status === "sent"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {status === "sent"
                ? "Thanks — your message is on its way."
                : "Something went wrong. Please try again or email me directly."}
            </p>
          )}
        </form>

        {/* Separator */}
        <div className="relative mt-16 mb-0">
          <div className="absolute left-[-100vw] right-[-100vw] h-0 border-b border-black/30 dark:border-white/[0.15] pointer-events-none" style={{ maskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)', WebkitMaskImage: 'repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)' }} />
          {/* Intersection nodes */}
          <div className="absolute -left-8 md:-left-4 w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] -translate-x-1/2 translate-y-[-1px] pointer-events-none z-20" />
          <div className="absolute -right-8 md:-right-4 w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] translate-x-1/2 translate-y-[-1px] pointer-events-none z-20" />
        </div>

        {/* Footer - Socials + Displacement Text */}
        <div className="pt-2 -mt-4 pb-5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden">
          <div className="flex-shrink-0">
            <p className="text-[14px] text-zinc-500 mb-2">Find me on my <span className="font-medium text-zinc-800 dark:text-zinc-200">socials</span></p>
            <SocialLinks />
          </div>

          {/* The displacement wordmark. No negative margin here: the parent
              clips with `overflow-hidden`, and the template's `-mr-56` pushed
              224px of the box past the clip edge — calibrated for its own
              eleven-character wordmark, which was meant to bleed. With five
              letters it left a stray glyph fragment, so the box now ends where
              the column does and the whole word is visible.

              That leaves two very different boxes to sit in — about 110px wide
              beside the socials on desktop, ~300px stacked under them on mobile
              — so the size is fitted to the container rather than fixed.
              `fitWidth` is the fraction of the box the word spans; the rest is
              breathing room on either side. */}
          <div className="flex-grow h-[160px] relative flex items-center justify-end mt-2">
            <DisplacementText
              text="ESHIV"
              fitWidth={0.88}
              className="h-full w-full"
              lightColor="#171717"
              darkColor="#e5e5e5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
