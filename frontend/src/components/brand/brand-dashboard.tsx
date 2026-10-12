"use client";

import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/stat-card";
import { formatRupees } from "@/lib/format";
import { queries } from "@/lib/queries";

import { CampaignCard } from "./campaign-card";
import { CreateCampaignDialog } from "./create-campaign-dialog";

export function BrandDashboard() {
  const { data: campaigns, error, isPending } = useQuery(queries.myCampaigns);

  const totals = (campaigns ?? []).reduce(
    (sum, campaign) => ({
      budget: sum.budget + campaign.budget,
      spent: sum.spent + campaign.spent,
      remaining: sum.remaining + campaign.remaining,
    }),
    { budget: 0, spent: 0, remaining: 0 },
  );

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">Your campaigns</h1>
          <p className="text-muted-foreground">Track what each campaign has paid out and what is left.</p>
        </div>
        <CreateCampaignDialog />
      </section>

      <section aria-label="Budget overview" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total budget" value={formatRupees(totals.budget)} className="bg-wl-yellow" />
        <StatCard label="Spent" value={formatRupees(totals.spent)} className="bg-wl-pink" />
        <StatCard label="Remaining" value={formatRupees(totals.remaining)} className="bg-wl-green" />
      </section>

      <section aria-label="Campaigns" className="grid gap-6 lg:grid-cols-2">
        {error && <p className="font-semibold text-red-700">{error.message}</p>}
        {isPending && <p>Loading campaigns…</p>}
        {campaigns?.length === 0 && (
          <p className="text-muted-foreground">No campaigns yet. Launch your first one to start paying creators.</p>
        )}
        {campaigns?.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)}
      </section>
    </>
  );
}
