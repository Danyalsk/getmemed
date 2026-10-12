import { Suspense } from "react";

import { CampaignDetail } from "@/components/brand/campaign-detail";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

async function CampaignDetailForParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignDetail campaignId={id} />;
}

export default function CampaignPage({ params }: PageProps<"/brand/campaigns/[id]">) {
  return (
    <PageTransition>
      <Suspense>
        <CampaignDetailForParams params={params} />
      </Suspense>
    </PageTransition>
  );
}
