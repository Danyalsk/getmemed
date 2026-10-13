import { Suspense } from "react";

import { CampaignOverview } from "@/components/creator/campaign-overview";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

async function CampaignOverviewForParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignOverview campaignId={id} />;
}

export default function CreatorCampaignPage({ params }: PageProps<"/creator/campaigns/[id]">) {
  return (
    <PageTransition>
      <Suspense>
        <CampaignOverviewForParams params={params} />
      </Suspense>
    </PageTransition>
  );
}
