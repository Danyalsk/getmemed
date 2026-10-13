import { BrandCampaigns } from "@/components/brand/brand-campaigns";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function BrandCampaignsPage() {
  return (
    <PageTransition>
      <BrandCampaigns />
    </PageTransition>
  );
}
