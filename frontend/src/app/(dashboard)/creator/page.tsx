import { CreatorHome } from "@/components/creator/creator-home";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorHomePage() {
  return (
    <PageTransition>
      <CreatorHome />
    </PageTransition>
  );
}
