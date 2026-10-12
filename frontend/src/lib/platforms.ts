import { CameraIcon, PlayIcon, type LucideIcon } from "lucide-react";

import type { Platform } from "@contracts/common";

export const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: CameraIcon,
  youtube: PlayIcon,
};
