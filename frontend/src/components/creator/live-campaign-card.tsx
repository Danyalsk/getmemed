import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";

import { MilestoneLadder } from "@/components/milestone-ladder";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupees } from "@/lib/format";

import { SubmitPostDialog } from "./submit-post-dialog";

export function LiveCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">by {campaign.brand.name}</span>
          <Badge variant="outline">{PLATFORM_LABELS[campaign.platform]}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <MilestoneLadder milestones={campaign.milestones} />
        <p className="text-sm">
          <strong className="tabular-nums">{formatRupees(campaign.remaining)}</strong> left in the budget
        </p>
      </CardContent>
      <CardFooter>
        <SubmitPostDialog campaign={campaign} />
      </CardFooter>
    </Card>
  );
}
