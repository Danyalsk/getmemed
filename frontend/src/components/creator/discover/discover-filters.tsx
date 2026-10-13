import type { ReactNode } from "react";

import { campaignSortSchema, type CampaignSort } from "@contracts/campaign";
import { PLATFORM_LABELS, platformSchema, type Platform } from "@contracts/common";

import { SearchInput } from "@/components/list/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListState } from "@/hooks/use-list-state";
import { PLATFORM_ICONS } from "@/lib/platforms";

const SORT_LABELS: Record<CampaignSort, string> = {
  newest: "Newest",
  trending: "Most posts",
  budget: "Biggest budget",
};

export interface DiscoverFilterState {
  list: ListState;
  platform: Platform | undefined;
  sort: CampaignSort;
  setPlatform: (platform: Platform | undefined) => void;
  setSort: (sort: CampaignSort) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors ${active ? "border-foreground bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

export function DiscoverFilters({ list, platform, sort, setPlatform, setSort }: DiscoverFilterState) {
  const choosePlatform = (next: Platform | undefined) => {
    setPlatform(next);
    list.resetPage();
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card/60 p-3 backdrop-blur lg:flex-row lg:items-center">
      <div className="min-w-0 lg:flex-1 [&>div]:sm:max-w-none">
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search campaigns or brands" />
      </div>
      <div role="group" aria-label="Platform" className="flex shrink-0 gap-2">
        <Chip active={platform === undefined} onClick={() => choosePlatform(undefined)}>
          All
        </Chip>
        {platformSchema.options.map((option) => {
          const Icon = PLATFORM_ICONS[option];
          return (
            <Chip key={option} active={platform === option} onClick={() => choosePlatform(option)}>
              <Icon className="size-3.5" /> {PLATFORM_LABELS[option]}
            </Chip>
          );
        })}
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          setSort(campaignSortSchema.parse(value));
          list.resetPage();
        }}
      >
        <SelectTrigger aria-label="Sort campaigns" className="w-full lg:w-40 lg:shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {campaignSortSchema.options.map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
