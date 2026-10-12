import Link from "next/link";

import { SignedInRedirect } from "@/components/auth-gate";
import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <SignedInRedirect />
      <Link href="/" aria-label="Meme'd home">
        <Wordmark className="text-5xl" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
