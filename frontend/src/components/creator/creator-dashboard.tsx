"use client";

import { useCallback } from "react";

import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { useApiData } from "@/lib/use-api-data";

import { LiveCampaignCard } from "./live-campaign-card";
import { MySubmissions } from "./my-submissions";

export function CreatorDashboard() {
  const campaigns = useApiData(api.liveCampaigns);
  const mine = useApiData(api.mySubmissions);
  const { reload: reloadCampaigns } = campaigns;
  const { reload: reloadMine } = mine;

  // A payout changes both the creator's earnings and the campaign's remaining budget.
  const reloadAll = useCallback(() => {
    reloadCampaigns();
    reloadMine();
  }, [reloadCampaigns, reloadMine]);

  const submissions = mine.data?.submissions ?? [];

  return (
    <>
      <section className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl">Your earnings</h1>
        <p className="text-muted-foreground">Every milestone your posts cross gets paid out, until the campaign budget runs out.</p>
      </section>

      <section aria-label="Earnings overview" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatRupees(mine.data?.totalEarnings ?? 0)} className="bg-wl-green" />
        <StatCard label="Posts submitted" value={String(submissions.length)} className="bg-wl-purple" />
        <StatCard label="Live campaigns" value={String(campaigns.data?.length ?? 0)} className="bg-wl-yellow" />
      </section>

      <section aria-labelledby="live-heading" className="flex flex-col gap-4">
        <h2 id="live-heading" className="font-heading text-2xl">
          Live campaigns
        </h2>
        {campaigns.error && <p className="font-semibold text-red-700">{campaigns.error}</p>}
        {!campaigns.data && !campaigns.error && <p>Loading campaigns…</p>}
        {campaigns.data?.length === 0 && <p className="text-muted-foreground">No live campaigns right now. Check back soon.</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.data?.map((campaign) => (
            <LiveCampaignCard key={campaign.id} campaign={campaign} onSubmitted={reloadAll} />
          ))}
        </div>
      </section>

      <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
        <h2 id="posts-heading" className="font-heading text-2xl">
          Your posts
        </h2>
        {mine.error && <p className="font-semibold text-red-700">{mine.error}</p>}
        {!mine.data && !mine.error && <p>Loading posts…</p>}
        {mine.data && <MySubmissions submissions={submissions} onUpdated={reloadAll} />}
      </section>
    </>
  );
}
