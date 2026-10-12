import { Suspense } from "react";

import { CampaignDetail } from "@/components/brand/campaign-detail";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

async function CampaignDetailForParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignDetail campaignId={id} />;
}

export default function CampaignPage({ params }: PageProps<"/brand/campaigns/[id]">) {
  // Params are only known at request time, so they're awaited inside Suspense to keep a static shell.
  return (
    <Suspense>
      <CampaignDetailForParams params={params} />
    </Suspense>
  );
}
