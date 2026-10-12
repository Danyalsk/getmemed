import { RequireRole } from "@/components/auth-gate";

export default function BrandLayout({ children }: LayoutProps<"/brand">) {
  return <RequireRole role="brand">{children}</RequireRole>;
}
