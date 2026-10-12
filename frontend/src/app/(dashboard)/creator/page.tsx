import { CreatorDashboard } from "@/components/creator/creator-dashboard";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

export default function CreatorPage() {
  return <CreatorDashboard />;
}
