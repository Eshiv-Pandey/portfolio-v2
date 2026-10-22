"use client";

import { ActivityProfileCards } from "@/components/ActivityProfileCards";
import { GithubGraph } from "@/components/GithubGraph";
import { LeetCodeGraph, useLeetCodeProfile } from "@/components/LeetCodeGraph";
import { DesiDivider } from "@/components/desi/DesiDivider";
import { SectionHeading } from "@/components/desi/section";

export function ActivityHeatmaps() {
  const { data: profile, loading, error } = useLeetCodeProfile();
  return (
    <section id="activity" className="relative z-10 mt-6 flex scroll-mt-24 flex-col">
      <SectionHeading title="Activity" devanagari="गतिविधि" topRule aside="Last 12 months" />
      <div className="flex flex-col gap-7 pt-6 pb-2">
        <ActivityProfileCards profile={profile} loading={loading} error={error} />
        <GithubGraph />
        <DesiDivider pattern="tile" height={26} reverse framed={false} />
        <LeetCodeGraph profile={profile} loading={loading} error={error} />
      </div>
    </section>
  );
}
