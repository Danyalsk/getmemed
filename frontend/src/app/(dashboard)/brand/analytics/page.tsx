import { BrandAnalytics } from "@/components/brand/brand-analytics";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function BrandAnalyticsPage() {
  return (
    <PageTransition>
      <BrandAnalytics />
    </PageTransition>
  );
}
