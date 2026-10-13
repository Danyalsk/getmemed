import { CreatorDiscover } from "@/components/creator/discover/creator-discover";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorDiscoverPage() {
  return (
    <PageTransition>
      <CreatorDiscover />
    </PageTransition>
  );
}
