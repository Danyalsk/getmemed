import { JoinedCampaigns } from "@/components/creator/joined-campaigns";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function JoinedCampaignsPage() {
  return (
    <PageTransition>
      <JoinedCampaigns />
    </PageTransition>
  );
}
