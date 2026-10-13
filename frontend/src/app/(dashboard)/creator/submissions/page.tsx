import { CreatorSubmissions } from "@/components/creator/creator-submissions";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorSubmissionsPage() {
  return (
    <PageTransition>
      <CreatorSubmissions />
    </PageTransition>
  );
}
