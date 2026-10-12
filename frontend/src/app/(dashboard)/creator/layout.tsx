import { RequireRole } from "@/components/auth-gate";

export default function CreatorLayout({ children }: LayoutProps<"/creator">) {
  return <RequireRole role="creator">{children}</RequireRole>;
}
