import { CreatorPosts } from "@/components/creator/creator-posts";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

export default function CreatorPostsPage() {
  return <CreatorPosts />;
}
