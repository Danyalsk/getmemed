import { PLATFORM_LABELS, type Platform } from "@contracts/common";

import { formatRupees, formatViews } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";

interface PlatformRow {
  platform: Platform;
  posts: number;
  views: number;
  earned: number;
}

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "bg-wl-red",
  youtube: "bg-wl-lavender",
};

export function PlatformSplit({ rows, earnedLabel }: { rows: PlatformRow[]; earnedLabel: string }) {
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0);
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No posts yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {rows.map((row) => (
          <div
            key={row.platform}
            className={PLATFORM_COLORS[row.platform]}
            style={{ width: `${totalViews ? (row.views / totalViews) * 100 : 100 / rows.length}%` }}
          />
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = PLATFORM_ICONS[row.platform];
          return (
            <li key={row.platform} className="flex items-center gap-3 rounded-xl border p-3">
              <span className={`flex size-9 items-center justify-center rounded-lg ${PLATFORM_COLORS[row.platform]} text-wl-ink`}>
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col text-sm">
                <span className="font-medium">{PLATFORM_LABELS[row.platform]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {row.posts} posts · {formatViews(row.views)} views · {formatRupees(row.earned)} {earnedLabel}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
