import { CreatorPosts } from "@/components/creator/creator-posts";
import { PageTransition } from "@/components/page-transition";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

export default function CreatorPostsPage() {
  return (
    <PageTransition>
      <CreatorPosts />
    </PageTransition>
  );
}
