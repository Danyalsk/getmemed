import { BrandSubmissions } from "@/components/brand/brand-submissions";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function BrandSubmissionsPage() {
  return (
    <PageTransition>
      <BrandSubmissions />
    </PageTransition>
  );
}
