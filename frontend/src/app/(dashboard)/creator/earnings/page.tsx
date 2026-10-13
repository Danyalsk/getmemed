import { CreatorEarnings } from "@/components/creator/creator-earnings";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorEarningsPage() {
  return (
    <PageTransition>
      <CreatorEarnings />
    </PageTransition>
  );
}
