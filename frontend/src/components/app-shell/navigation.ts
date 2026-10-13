import {
  ChartPieIcon,
  ClapperboardIcon,
  CompassIcon,
  HouseIcon,
  MegaphoneIcon,
  SettingsIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@contracts/common";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const SETTINGS: NavSection = {
  title: "Account",
  items: [{ href: "/settings", label: "Settings", icon: SettingsIcon }],
};

export const NAVIGATION: Record<Role, NavSection[]> = {
  creator: [
    {
      title: "Discover",
      items: [
        { href: "/creator", label: "Home", icon: HouseIcon },
        { href: "/creator/discover", label: "Discover", icon: CompassIcon },
        { href: "/creator/campaigns", label: "My campaigns", icon: MegaphoneIcon },
      ],
    },
    {
      title: "My work",
      items: [
        { href: "/creator/analytics", label: "Analytics", icon: ChartPieIcon },
        { href: "/creator/submissions", label: "Submissions", icon: ClapperboardIcon },
        { href: "/creator/earnings", label: "Earnings", icon: WalletIcon },
      ],
    },
    SETTINGS,
  ],
  brand: [
    {
      title: "Workspace",
      items: [
        { href: "/brand", label: "Home", icon: HouseIcon },
        { href: "/brand/campaigns", label: "Campaigns", icon: MegaphoneIcon },
      ],
    },
    {
      title: "Performance",
      items: [
        { href: "/brand/analytics", label: "Analytics", icon: ChartPieIcon },
        { href: "/brand/submissions", label: "Submissions", icon: ClapperboardIcon },
      ],
    },
    SETTINGS,
  ],
};

const HOME_PATHS = new Set(["/creator", "/brand"]);

export function isActivePath(href: string, pathname: string): boolean {
  return HOME_PATHS.has(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
