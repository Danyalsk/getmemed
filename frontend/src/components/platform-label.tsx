import { PLATFORM_LABELS, type Platform } from "@contracts/common";

import { PLATFORM_ICONS } from "@/lib/platforms";

export function PlatformLabel({ platform }: { platform: Platform }) {
  const Icon = PLATFORM_ICONS[platform];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5" />
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
