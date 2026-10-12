import { BrandDashboard } from "@/components/brand/brand-dashboard";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function BrandPage() {
  return (
    <PageTransition>
      <BrandDashboard />
    </PageTransition>
  );
}
