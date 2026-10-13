import { RequireSession } from "@/components/auth-gate";

export default function BrandLayout({ children }: LayoutProps<"/brand">) {
  return <RequireSession role="brand">{children}</RequireSession>;
}
