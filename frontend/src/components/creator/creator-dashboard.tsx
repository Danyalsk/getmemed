"use client";

import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/stat-card";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { LiveCampaignCard } from "./live-campaign-card";
import { MySubmissions } from "./my-submissions";

export function CreatorDashboard() {
  const campaigns = useQuery(queries.liveCampaigns);
  const mine = useQuery(queries.mySubmissions);

  return (
    <>
      <section className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl">Your earnings</h1>
        <p className="text-muted-foreground">Every milestone your posts cross gets paid out, until the campaign budget runs out.</p>
      </section>

      <section aria-label="Earnings overview" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatRupees(mine.data?.totalEarnings ?? 0)} className="bg-wl-green" />
        <StatCard label="Posts submitted" value={String(mine.data?.submissions.length ?? 0)} className="bg-wl-purple" />
        <StatCard label="Live campaigns" value={String(campaigns.data?.length ?? 0)} className="bg-wl-yellow" />
      </section>

      <section aria-labelledby="live-heading" className="flex flex-col gap-4">
        <h2 id="live-heading" className="font-heading text-2xl">
          Live campaigns
        </h2>
        {campaigns.error && <p className="font-semibold text-red-700">{campaigns.error.message}</p>}
        {campaigns.isPending && <p>Loading campaigns…</p>}
        {campaigns.data?.length === 0 && <p className="text-muted-foreground">No live campaigns right now. Check back soon.</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.data?.map((campaign) => <LiveCampaignCard key={campaign._id} campaign={campaign} />)}
        </div>
      </section>

      <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
        <h2 id="posts-heading" className="font-heading text-2xl">
          Your posts
        </h2>
        {mine.error && <p className="font-semibold text-red-700">{mine.error.message}</p>}
        {mine.isPending && <p>Loading posts…</p>}
        {mine.data && <MySubmissions submissions={mine.data.submissions} />}
      </section>
    </>
  );
}
