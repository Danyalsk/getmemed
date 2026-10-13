import { AccountSettings } from "@/components/settings/account-settings";
import { PageTransition } from "@/components/page-transition";

export const instant = false;

export default function SettingsPage() {
  return (
    <PageTransition>
      <AccountSettings />
    </PageTransition>
  );
}
