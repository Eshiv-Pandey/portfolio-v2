"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { SiGithub, SiLeetcode } from "react-icons/si";
import { ActivityMascot } from "@/components/ActivityMascot";
import type { LeetCodeProfilePayload } from "@/components/LeetCodeGraph";
import { useCachedJson } from "@/hooks/use-cached-json";
import type { HeatmapDay } from "@/lib/heatmap";
import type { PullRequestSummary } from "@/lib/pull-requests";
import styles from "./activity-profile-cards.module.css";

interface ContributionSummary { total: number; days: HeatmapDay[]; source: "public" | "graphql" }
interface ProfileCardProps {
  kind: "github" | "leetcode" | "hami" | "sugarlabs" | "webpack";
  name?: string;
  handle?: string;
  href?: string;
  logo?: string;
  edition: number;
  total: number | null;
  loading: boolean;
  error: string | null;
  stats: { label: string; value: number | null }[];
}

function number(value: number | null) { return value === null ? "—" : value.toLocaleString(); }

function ProfileCard({ kind, total, loading, error, stats, name: customName, handle, href: customHref, logo, edition }: ProfileCardProps) {
  const github = kind === "github";
  const name = customName ?? (github ? "GitHub" : "LeetCode");
  const username = github ? "Eshiv-Pandey" : "Eshiv_Pandey";
  const href = customHref ?? (github ? "https://github.com/Eshiv-Pandey" : "https://leetcode.com/u/Eshiv_Pandey/");
  const Icon = kind === "leetcode" ? SiLeetcode : SiGithub;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles[kind]}`} aria-label={`${name} profile card`}
      onPointerEnter={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--reveal-x", `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty("--reveal-y", `${event.clientY - bounds.top}px`);
      }}>
      <div className={styles.art}>
        <div className={styles.level}>
          <span className={styles.stripes} aria-hidden="true" />
          <span>{logo ? "MERGED PRS" : github ? "CONTRIBUTIONS" : "SOLVED"} <b>{number(total)}</b></span>
        </div>
        <div className={`${styles.sprite} ${logo ? styles.orgSprite : ""}`}>
          {logo ? <><span className={styles.sparkle} aria-hidden="true">✦</span><Image src={logo} alt="" width={110} height={110} className={styles.orgLogo} /><span className={styles.sparkle} aria-hidden="true">✦</span></> : <ActivityMascot kind={github ? "github" : "leetcode"} />}
        </div>
        <span className={styles.edition}>0{edition}/05</span>
      </div>
      <div className={styles.identity}><h3>{name}</h3><ArrowUpRight size={15} aria-hidden="true" /></div>
      <p className={styles.handle}>{handle ?? `@${username}`}</p>
      <dl className={styles.stats}>{stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{number(stat.value)}</dd></div>)}</dl>
      <div className={styles.bottom}><Icon aria-hidden="true" /><span>{logo ? "OPEN SOURCE" : github ? "KEEP BUILDING" : "KEEP LEARNING"}</span></div>
      {(loading || error) && <span className={styles.status} aria-live="polite">{error ? "Activity unavailable" : "Loading activity…"}</span>}
    </a>
  );
}

export function ActivityProfileCards({ profile, loading, error }: { profile: LeetCodeProfilePayload | null; loading: boolean; error: string | null }) {
  const github = useCachedJson<ContributionSummary>("/api/contributions", "github_contributions", "v3");
  const contributions = useCachedJson<PullRequestSummary>("/api/pull-requests", "pull_requests", "v2");
  const orgs = [
    { kind: "hami", name: "HAMi", owner: "project-hami", logo: "/images/hami.png", handle: "Project Member · CNCF" },
    { kind: "sugarlabs", name: "Sugar Labs", owner: "sugarlabs", logo: "/images/sugarlabs.png", handle: "Contributor · Music Blocks" },
    { kind: "webpack", name: "webpack", owner: "webpack", logo: "/images/webpack.png", handle: "Contributor · Build tools" },
  ] as const;
  return (
    <div className={styles.cards}>
      <ProfileCard kind="github" edition={1} total={github.data?.total ?? null} loading={github.loading} error={github.error} stats={[
        { label: "Active days", value: github.data ? github.data.days.filter(day => day.count > 0).length : null },
        { label: "Best day", value: github.data ? Math.max(0, ...github.data.days.map(day => day.count)) : null },
      ]} />
      {orgs.map((org, index) => {
        const prs = contributions.data ? Object.values(contributions.data.buckets).flat().filter(pr => pr.repo.split("/")[0].toLowerCase() === org.owner) : null;
        return <ProfileCard key={org.kind} kind={org.kind} name={org.name} handle={org.handle} logo={org.logo} edition={index + 2}
          href={`https://github.com/${org.owner}/`}
          total={prs ? prs.filter(pr => pr.state === "merged").length : null}
          loading={contributions.loading} error={contributions.error} stats={[
            { label: "Pull requests", value: prs?.length ?? null },
            { label: "Repositories", value: prs ? new Set(prs.map(pr => pr.repo)).size : null },
          ]} />;
      })}
      <ProfileCard kind="leetcode" edition={5} total={profile?.solved.all ?? null} loading={loading} error={error} stats={[
        { label: "Submissions", value: profile?.submissions ?? null },
        { label: "Streak", value: profile?.streak ?? null },
      ]} />
    </div>
  );
}
