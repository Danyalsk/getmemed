import { RequireSession } from "@/components/auth-gate";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return <RequireSession>{children}</RequireSession>;
}
