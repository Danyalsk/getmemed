import { CreatorDiscover } from "@/components/creator/creator-discover";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorPage() {
  return (
    <PageTransition>
      <CreatorDiscover />
    </PageTransition>
  );
}
