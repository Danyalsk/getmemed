import { CreatorAnalytics } from "@/components/creator/creator-analytics";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorAnalyticsPage() {
  return (
    <PageTransition>
      <CreatorAnalytics />
    </PageTransition>
  );
}
