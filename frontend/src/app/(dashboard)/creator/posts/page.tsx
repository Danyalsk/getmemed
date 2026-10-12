import { CreatorPosts } from "@/components/creator/creator-posts";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function CreatorPostsPage() {
  return (
    <PageTransition>
      <CreatorPosts />
    </PageTransition>
  );
}
