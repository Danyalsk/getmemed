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
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-[#0e0e0e] bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklab,var(--color-brand)_22%,transparent),transparent_55%)]"
    >
      <span className="absolute bottom-4 left-4 max-w-[70%] text-2xl leading-tight font-semibold">{campaign.name}</span>
    </div>
  );
}
