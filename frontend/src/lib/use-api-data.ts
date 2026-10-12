"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "./api";

/**
 * Loads data on mount and whenever `reload` is called. Responses that arrive
 * after a newer request started are ignored. `load` must be stable
 * (module-level or memoised) to avoid refetch loops.
 */
export function useApiData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let stale = false;
    load()
      .then((result) => {
        if (stale) return;
        setData(result);
        setError(undefined);
      })
      .catch((err: unknown) => {
        if (!stale) setError(errorMessage(err));
      });
    return () => {
      stale = true;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { data, error, reload };
}
