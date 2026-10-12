const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export const formatRupees = (amount: number): string => rupees.format(amount);

export const formatRupeesCompact = (amount: number): string => compactRupees.format(amount);

export const formatViews = (views: number): string => compact.format(views);

export const formatDate = (iso: string): string => date.format(new Date(iso));

export function formatRelativeTime(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const match = UNITS.find(([, size]) => Math.abs(seconds) >= size);
  return match ? relative.format(Math.round(seconds / match[1]), match[0]) : "just now";
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
