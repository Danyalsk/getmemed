"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { useSession } from "@/lib/session";

function ResetCacheOnSessionChange({ client }: { client: QueryClient }) {
  const token = useSession()?.token;
  useEffect(() => {
    client.clear();
  }, [client, token]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );

  return (
    <QueryClientProvider client={client}>
      <ResetCacheOnSessionChange client={client} />
      {children}
    </QueryClientProvider>
  );
}
