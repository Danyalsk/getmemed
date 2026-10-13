"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, ChartPieIcon, MegaphoneIcon, PiggyBankIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/analytics/panel";
import { CampaignCardSkeleton } from "@/components/campaign-card";
import { ScrollRow } from "@/components/scroll-row";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SubmissionsTable } from "@/components/submissions-table";
import { Button } from "@/components/ui/button";
import { formatRupees, formatViews } from "@/lib/format";
import { queries } from "@/lib/queries";
import { useSession } from "@/lib/session";

import { BrandCampaignCard } from "./brand-campaign-card";
import { CreateCampaignDialog } from "./create-campaign-dialog";

const RECENT_COUNT = 5;

export function BrandHome() {
  const session = useSession();
  const analytics = useQuery(queries.brandAnalytics);
  const campaigns = useQuery(queries.myCampaigns({ page: 1, pageSize: 10, status: "active" }));
  const recent = useQuery(queries.brandSubmissions({ page: 1, pageSize: RECENT_COUNT }));
  const totals = analytics.data?.totals;

  return (
    <>
      <PageHeader
        title={`Welcome back${session ? `, ${session.user.name}` : ""}`}
        description="A snapshot of your campaigns and the latest creator posts."
        actions={<CreateCampaignDialog />}
      />

      <section aria-label="Overview" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Active campaigns"
          value={totals && `${totals.activeCampaigns} of ${totals.campaigns}`}
          icon={MegaphoneIcon}
        />
        <StatCard label="Total views" value={totals && formatViews(totals.views)} icon={TrendingUpIcon} />
        <StatCard label="Paid out" value={totals && formatRupees(totals.earned)} icon={ChartPieIcon} />
        <StatCard
          label="Budget remaining"
          value={totals && formatRupees(totals.budget - totals.earned)}
          icon={PiggyBankIcon}
        />
      </section>

      {campaigns.data?.total !== 0 && (
        <ScrollRow title="Live campaigns" description="Your active campaigns and how much of each budget is used.">
          {(campaigns.data?.items ?? Array.from({ length: 3 }, () => null)).map((campaign, index) => (
            <div key={campaign?._id ?? index} className="w-[290px] shrink-0 snap-start sm:w-[340px]">
              {campaign ? <BrandCampaignCard campaign={campaign} /> : <CampaignCardSkeleton />}
            </div>
          ))}
        </ScrollRow>
      )}

      <Panel
        title="Latest submissions"
        description="The newest posts across all your campaigns."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/brand/submissions">
              View all <ArrowRightIcon />
            </Link>
          </Button>
        }
      >
        {recent.data?.total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No posts yet. They show up here as creators submit them.</p>
        ) : (
          <SubmissionsTable submissions={recent.data?.items} viewer="brand" />
        )}
      </Panel>
    </>
  );
}
