import { SiteHeader } from "@/components/site-header";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">{children}</main>
    </>
  );
}
