"use client";

import { useState } from "react";

import type { CampaignSort } from "@contracts/campaign";
import type { Platform } from "@contracts/common";

import { useListState } from "@/hooks/use-list-state";

import { AllCampaignsSection } from "./all-campaigns-section";
import { DiscoverFilters } from "./discover-filters";
import { FeaturedCarousel } from "./featured-carousel";
import { TrendingRow } from "./trending-row";

export function CreatorDiscover() {
  const list = useListState();
  const [platform, setPlatform] = useState<Platform>();
  const [sort, setSort] = useState<CampaignSort>("newest");
  const filtering = Boolean(list.query.search ?? platform);

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <DiscoverFilters list={list} platform={platform} sort={sort} setPlatform={setPlatform} setSort={setSort} />
      {!filtering && (
        <>
          <FeaturedCarousel />
          <TrendingRow />
        </>
      )}
      <AllCampaignsSection list={list} platform={platform} sort={sort} />
    </div>
  );
}
