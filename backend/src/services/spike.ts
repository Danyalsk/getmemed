const MS_PER_HOUR = 3_600_000;
const MIN_WINDOW_MS = 60_000;

interface SpikeThresholds {
  minDelta: number;
  viewsPerHour: number;
}

interface SpikeInput {
  previousViews: number;
  views: number;
  since: Date;
  now: Date;
}

export function detectViewSpike(
  { previousViews, views, since, now }: SpikeInput,
  { minDelta, viewsPerHour }: SpikeThresholds,
): string | null {
  const gained = views - previousViews;
  if (gained < minDelta) return null;

  const windowMs = Math.max(now.getTime() - since.getTime(), MIN_WINDOW_MS);
  const rate = Math.round((gained / windowMs) * MS_PER_HOUR);
  if (rate < viewsPerHour) return null;

  const minutes = Math.round(windowMs / 60_000);
  return `Gained ${gained.toLocaleString("en-IN")} views in ${minutes} min (~${rate.toLocaleString("en-IN")}/hour)`;
}
