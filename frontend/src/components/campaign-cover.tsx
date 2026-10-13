import Image from "next/image";

import type { Campaign } from "@contracts/campaign";

import { getImageUrl } from "@/lib/api";

interface CampaignCoverProps {
  campaign: Pick<Campaign, "name" | "coverImage">;
  sizes: string;
  priority?: boolean;
}

export function CampaignCover({ campaign, sizes, priority }: CampaignCoverProps) {
  if (campaign.coverImage) {
    return (
      <Image
        src={getImageUrl(campaign.coverImage)}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#0e0e0e]">
      <div className="absolute -top-6 right-8 h-24 w-1/2 bg-wl-red" />
      <div className="absolute top-4 right-1/2 h-12 w-14 bg-wl-yellow" />
      <div className="absolute right-0 bottom-0 h-1/2 w-12 bg-wl-lavender" />
      <span className="absolute bottom-4 left-4 max-w-[70%] text-2xl leading-tight font-semibold">{campaign.name}</span>
    </div>
  );
}
