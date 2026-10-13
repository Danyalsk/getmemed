"use client";

import { useEffect, useState } from "react";

import { PAGE_SIZE_OPTIONS } from "@contracts/common";

const SEARCH_DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useListState() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  return {
    query: { page, pageSize, search: debouncedSearch || undefined },
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    resetPage: () => setPage(1),
  };
}

export type ListState = ReturnType<typeof useListState>;
