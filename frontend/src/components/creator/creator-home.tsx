"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, ClapperboardIcon, IndianRupeeIcon, MegaphoneIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

import { CampaignCardSkeleton } from "@/components/campaign-card";
import { PageHeader } from "@/components/page-header";
import { ScrollRow } from "@/components/scroll-row";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { formatRupees, formatViews } from "@/lib/format";
import { queries } from "@/lib/queries";
import { useSession } from "@/lib/session";

import { CreatorCampaignCard } from "./creator-campaign-card";
import { CampaignRow } from "./discover/campaign-row";
import { ParticipationSummary } from "./participation-summary";

export function CreatorHome() {
  const session = useSession();
  const analytics = useQuery(queries.creatorAnalytics);
  const joined = useQuery(queries.joinedCampaigns({ page: 1, pageSize: 10 }));
  const totals = analytics.data?.totals;
  const firstName = session?.user.name.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description="Here's how your posts are doing."
        actions={
          <Button asChild>
            <Link href="/creator/discover">
              Find campaigns <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      <section aria-label="Overview" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total earned" value={totals && formatRupees(totals.earned)} icon={IndianRupeeIcon} />
        <StatCard label="Total views" value={totals && formatViews(totals.views)} icon={TrendingUpIcon} />
        <StatCard label="Posts" value={totals && String(totals.posts)} icon={ClapperboardIcon} />
        <StatCard label="Campaigns joined" value={totals && String(totals.campaigns)} icon={MegaphoneIcon} />
      </section>

      {joined.data?.total !== 0 && (
        <ScrollRow title="Continue earning" description="Campaigns you've already posted to.">
          {(joined.data?.items ?? Array.from({ length: 3 }, () => null)).map((campaign, index) => (
            <div key={campaign?._id ?? index} className="w-[290px] shrink-0 snap-start sm:w-[340px]">
              {campaign ? (
                <CreatorCampaignCard
                  campaign={campaign}
                  footer={<ParticipationSummary participation={campaign.participation} />}
                />
              ) : (
                <CampaignCardSkeleton />
              )}
            </div>
          ))}
        </ScrollRow>
      )}

      <CampaignRow title="New for you" description="The latest campaigns from brands on Meme'd." sort="newest" />
    </>
  );
}
