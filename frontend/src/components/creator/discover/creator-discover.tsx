import { AllCampaignsSection } from "./all-campaigns-section";
import { CampaignRow } from "./campaign-row";
import { FeaturedCarousel } from "./featured-carousel";
import { TrendingRow } from "./trending-row";

export function CreatorDiscover() {
  return (
    <>
      <FeaturedCarousel />
      <CampaignRow title="Biggest budgets" description="Campaigns with the most money left to earn." sort="budget" />
      <TrendingRow />
      <CampaignRow title="New campaigns" description="Fresh drops: get in before everyone else." sort="newest" />
      <AllCampaignsSection />
    </>
  );
}
