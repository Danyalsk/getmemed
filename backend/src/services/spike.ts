const MS_PER_HOUR = 3_600_000;
// Floor the window so near-simultaneous updates don't produce absurd rates.
const MIN_WINDOW_MS = 60_000;

interface SpikeThresholds {
  minDelta: number;
  viewsPerHour: number;
}

interface SpikeInput {
  previousViews: number;
  views: number;
  /** When the previous count was recorded (submission time for the first update). */
  since: Date;
  now: Date;
}

/**
 * Flags growth that is both large in absolute terms and unusually fast, e.g.
 * bought views. Returns a human-readable reason, or null when growth looks organic.
 */
export function detectSpike(
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
