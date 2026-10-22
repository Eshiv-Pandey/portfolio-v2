"use client";

import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { MediumPost } from "@/lib/medium";
import { MEDIUM_PROFILE_URL } from "@/lib/medium";
import styles from "./reading-folder.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});
const TAB_COLORS = ["#e7a0ab", "#f4e9d1", "#b2d4c6", "#f1cc64"];
const fileNumber = (index: number) => String(index + 1).padStart(2, "0");

/** An open, tabbed document folder, populated by the server's Medium feed. */
export function BlogList({ posts }: { posts: MediumPost[] }) {
  const [selectedLink, setSelectedLink] = useState(posts[0]?.link ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const foundIndex = posts.findIndex((post) => post.link === selectedLink);
  const activeIndex = Math.max(0, foundIndex);
  const post = posts[activeIndex];

  function selectTab(index: number, focus = false) {
    setSelectedLink(posts[index].link);
    if (focus) tabRefs.current[index]?.focus();
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % posts.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + posts.length) % posts.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = posts.length - 1;
    else return;
    event.preventDefault();
    selectTab(next, true);
  }

  return (
    <div className={styles.reading}>
      <div className={styles.folder}>
        <span className={styles.folderLabel}>Field notes</span>
        <div className={styles.spread}>
          <aside className={styles.leftPage}>
            <div className={styles.indexPaper}>
              <h3 className={styles.indexTitle}>Notes &amp; ideas.</h3>
              <div className={styles.contents}>
                {posts.map((item, index) => (
                  <button key={item.link} type="button" onClick={() => selectTab(index)} aria-pressed={index === activeIndex} className={styles.contentsItem}>
                    <span className={styles.itemNumber}>{fileNumber(index)}</span>
                    <span>{item.title}</span>
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </button>
                ))}
                {posts.length === 0 && <p className={styles.indexIntro}>Browse the complete collection on Medium.</p>}
              </div>
            </div>
            <a className={styles.note} href={MEDIUM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              <span className={styles.paperclip} aria-hidden="true" />
              <span className={styles.signature}>Eshiv Pandey</span>
              <span>On Medium <ArrowUpRight aria-hidden="true" size={12} /></span>
            </a>
          </aside>

          <div className={styles.documentArea}>
            <div className={styles.backSheet} aria-hidden="true" />
            <div className={styles.tabs} role="tablist" aria-label="Medium articles" aria-orientation="vertical">
              {posts.map((item, index) => (
                <button
                  key={item.link}
                  ref={(element) => { tabRefs.current[index] = element; }}
                  type="button" role="tab" id={`reading-tab-${index}`} aria-controls="reading-document"
                  aria-selected={activeIndex === index} aria-label={`File ${fileNumber(index)}: ${item.title}`}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => selectTab(index)} onKeyDown={(event) => navigateTabs(event, index)}
                  className={styles.tab} style={{ "--tab-color": TAB_COLORS[index % TAB_COLORS.length] } as CSSProperties}
                >
                  <span>{fileNumber(index)}</span>
                </button>
              ))}
            </div>
            <article id="reading-document" role={post ? "tabpanel" : undefined} aria-labelledby={post ? `reading-tab-${activeIndex}` : undefined} tabIndex={0} className={styles.document}>
              <div className={styles.holes} aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div key={post?.link ?? "empty"} className={styles.documentContent}>
                {post ? (
                  <>
                    <div className={styles.byline}><time dateTime={post.date}>{DATE_FORMAT.format(new Date(post.date))}</time><span>{post.readingTime}</span></div>
                    <h3 className={styles.documentTitle}>{post.title}</h3>
                    <div className={styles.excerpt}>
                      <p>{post.description}</p>
                    </div>
                    {post.image && <div className={styles.imageFrame}><Image src={post.image} alt={`Illustration from ${post.title}`} fill sizes="(max-width: 600px) 75vw, (max-width: 1200px) 40vw, 480px" className={styles.postImage} /></div>}
                    <div className={styles.documentFooter}>
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className={styles.readLink}>Read on Medium <ArrowUpRight aria-hidden="true" size={16} /></a>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className={styles.documentTitle}>The notes<br />live on Medium.</h3>
                    <p className={styles.emptyText}>The articles couldn&apos;t be loaded right now. You can still read them in my Medium archive.</p>
                    <a href={MEDIUM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={styles.readLink}>Visit my Medium <ArrowUpRight aria-hidden="true" size={16} /></a>
                  </>
                )}
                <div className={styles.bottomMarks} aria-hidden="true"><span className={styles.stamp}>✦</span></div>
              </div>
            </article>
          </div>
        </div>
      </div>
      {posts.length > 0 && <div className={styles.pagination}>
        <p aria-live="polite">{fileNumber(activeIndex)} / {fileNumber(posts.length - 1)}</p>
        <div>
          <button type="button" aria-label="Previous article" disabled={activeIndex === 0} onClick={() => selectTab(activeIndex - 1)}><ChevronLeft aria-hidden="true" size={16} /></button>
          <button type="button" aria-label="Next article" disabled={activeIndex === posts.length - 1} onClick={() => selectTab(activeIndex + 1)}><ChevronRight aria-hidden="true" size={16} /></button>
        </div>
      </div>}
    </div>
  );
}
