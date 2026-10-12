"use client";

import { useSyncExternalStore } from "react";

import { authResponseSchema, type AuthResponse } from "@contracts/auth";
import type { Role } from "@contracts/common";

const STORAGE_KEY = "memed.session";

export const HOME_BY_ROLE: Record<Role, "/brand" | "/creator"> = {
  brand: "/brand",
  creator: "/creator",
};

const listeners = new Set<() => void>();
// useSyncExternalStore needs a stable snapshot, so parse once per stored value.
let snapshot: { raw: string | null; session: AuthResponse | null } = { raw: null, session: null };

function parseSession(raw: string): AuthResponse | null {
  try {
    const parsed = authResponseSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function readSession(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== snapshot.raw) {
    snapshot = { raw, session: raw === null ? null : parseSession(raw) };
  }
  return snapshot.session;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Keeps tabs in sync when the user logs in or out elsewhere.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveSession(session: AuthResponse): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  notify();
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function getToken(): string | null {
  return readSession()?.token ?? null;
}

/** `undefined` until hydrated on the client, then the session or `null`. */
export function useSession(): AuthResponse | null | undefined {
  return useSyncExternalStore(subscribe, readSession, () => undefined);
}
