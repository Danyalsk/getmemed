import Image from "next/image";

import type { Campaign } from "@contracts/campaign";

import { imageUrl } from "@/lib/api";

interface CampaignCoverProps {
  campaign: Pick<Campaign, "name" | "coverImage">;
  sizes: string;
  priority?: boolean;
}

/** Fills its (relatively positioned) parent. Older campaigns without a photo get a branded tile. */
export function CampaignCover({ campaign, sizes, priority }: CampaignCoverProps) {
  if (campaign.coverImage) {
    return (
      <Image
        src={imageUrl(campaign.coverImage)}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        // Covers are already compressed to WebP on upload.
        unoptimized
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
