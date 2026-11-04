"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, LoaderCircle, Mail, Phone, Send } from "lucide-react";
import { CommandMenu } from "@/components/command-menu";
import { ContactMessages } from "@/components/ContactMessages";
import { ThemeToggle } from "@/components/theme-toggle";
import { SOCIALS } from "@/lib/socials";
import { playMessagePop } from "@/lib/contact-sound";
import styles from "./contact.module.css";

const noteFont = localFont({
  src: "../../../scripts/assets/Caveat.ttf",
  variable: "--font-contact-hand",
  display: "swap",
  weight: "400 700",
});
const EMAIL = "eshivpandey18@gmail.com";
const EMPTY_NOTE = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [formData, setFormData] = useState(EMPTY_NOTE);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sentNote, setSentNote] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const submitting = useRef(false);
  const [conversationReady, setConversationReady] = useState(false);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = window.setTimeout(() => setCopyStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const isFormValid = Object.values(formData).every((value) => value.trim() !== "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !isFormValid) return;
    submitting.current = true;
    setStatus("sending");
    const form = event.currentTarget;
    const data = new FormData(form);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || (result?.success !== true && result?.success !== "true")) {
        throw new Error("The note was not accepted.");
      }
      setSentNote(formData.message.trim());
      form.reset();
      setFormData(EMPTY_NOTE);
      setStatus("sent");
      playMessagePop();
    } catch {
      // Retain the note and sender details so a retry never loses their work.
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className={`${styles.page} ${noteFont.variable}`}>
      <main className={styles.main}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back home
          </Link>
          <div className={styles.controls}>
            <CommandMenu />
            <ThemeToggle />
          </div>
        </header>

        <h1 className={styles.title}>Let&apos;s talk.</h1>
        <div className={styles.content}>
        <section className={styles.sheet} aria-label="Leave Eshiv a note">
          <div className={styles.holes} aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          </div>
          <ContactMessages email={EMAIL} copyStatus={copyStatus} onCopy={copyEmail} onComplete={setConversationReady} />
          {sentNote && <div className={styles.mine}><p className={styles.sentBubble}>{sentNote}</p></div>}

          {status === "sent" ? (
            <div className={styles.reply}>
              <p className={styles.bubble} role="status">Your note was sent. Thanks for reaching out.</p>
              <button type="button" className={styles.another} onClick={() => { setSentNote(""); setStatus("idle"); }}>Write another note</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.compose} aria-busy={status === "sending"} data-ready={conversationReady} inert={!conversationReady} aria-hidden={!conversationReady}>
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_subject" value="New Submission from Portfolio" />
              <input type="text" name="_honey" className={styles.trap} tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className={styles.slip} data-sending={status === "sending" || undefined}>
                <label htmlFor="contact-message" className="sr-only">Your note to Eshiv</label>
                <textarea
                  id="contact-message" name="message" rows={2} required maxLength={2000}
                  value={formData.message} disabled={status === "sending"}
                  placeholder="Dear Eshiv..."
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
                />
                <div className={styles.from}>
                  <label htmlFor="contact-name">Name:</label>
                  <input id="contact-name" name="name" autoComplete="name" required maxLength={80} placeholder="Your name" value={formData.name} disabled={status === "sending"} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                </div>
                <div className={styles.from}>
                  <label htmlFor="contact-email">From:</label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@email.com" value={formData.email} disabled={status === "sending"} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                </div>
              </div>
              <button type="submit" className={styles.send} disabled={status === "sending" || !isFormValid}>
                {status === "sending" ? <>Sending note <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /></> : <>Send note <Send size={16} aria-hidden="true" /></>}
              </button>
              {status === "sending" && <p className="sr-only" role="status">Sending your note.</p>}
              {status === "error" && <p className={styles.error} role="alert">Couldn&apos;t send. Retry, or <a href={`mailto:${EMAIL}`}>email me.</a></p>}
            </form>
          )}
        </section>

        <aside className={styles.aside} aria-label="Contact details">
        <dl className={styles.details}>
          <div><dt>Mail</dt><dd><a href={`mailto:${EMAIL}`} aria-label="Email Eshiv"><Mail size={20} aria-hidden="true" className={styles.detailIcon} /><span className={styles.detailText}>{EMAIL}</span></a></dd></div>
          <div><dt>Call</dt><dd><a href="tel:+918279628207" aria-label="Call Eshiv"><Phone size={20} aria-hidden="true" className={styles.detailIcon} /><span className={styles.detailText}>+91 82796 28207</span></a></dd></div>
          <div>
            <dt>Socials</dt>
            <dd className={styles.socials}>
              {SOCIALS.map(({ name, href, Icon }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`}><Icon aria-hidden="true" className={styles.socialIcon} /><span className={styles.socialName}>{name}</span><ArrowUpRight size={12} aria-hidden="true" className={styles.socialArrow} /></a>
              ))}
            </dd>
          </div>
        </dl>
        <p className={styles.location}>New Delhi, India</p>
        </aside>
        </div>
      </main>
    </div>
  );
}
