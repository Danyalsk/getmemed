import { CreatorDiscover } from "@/components/creator/creator-discover";
import { PageTransition } from "@/components/page-transition";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

export default function CreatorPage() {
  return (
    <PageTransition>
      <CreatorDiscover />
    </PageTransition>
  );
}
