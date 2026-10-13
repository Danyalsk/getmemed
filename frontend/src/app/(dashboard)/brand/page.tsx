import { BrandHome } from "@/components/brand/brand-home";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function BrandHomePage() {
  return (
    <PageTransition>
      <BrandHome />
    </PageTransition>
  );
}
