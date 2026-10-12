import { BrandDashboard } from "@/components/brand/brand-dashboard";

// Rendered behind a client-side session check, so navigation can't be instant.
export const instant = false;

export default function BrandPage() {
  return <BrandDashboard />;
}
