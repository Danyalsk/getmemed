import { RequireSession } from "@/components/auth-gate";

export default function CreatorLayout({ children }: LayoutProps<"/creator">) {
  return <RequireSession role="creator">{children}</RequireSession>;
}
