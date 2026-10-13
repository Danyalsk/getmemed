"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { useId, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";
import { normalizePostUrl, postSubmissionSchemaFor, type PostSubmissionInput } from "@contracts/submission";

import { CampaignCover } from "@/components/campaign-cover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiRequestError, api } from "@/lib/api";
import { formatRupees, formatRupeesCompact, formatViews } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { invalidateQueryRoots } from "@/lib/queries";

const POST_URL_PLACEHOLDERS = {
  instagram: "https://www.instagram.com/reel/…",
  youtube: "https://youtube.com/shorts/…",
} satisfies Record<Campaign["platform"], string>;

type CheckState = "pass" | "fail" | "pending";

const CHECK_ICONS: Record<CheckState, ReactNode> = {
  pass: <CircleCheckIcon className="size-5 text-wl-lime" />,
  fail: <CircleXIcon className="size-5 text-destructive" />,
  pending: <CircleDashedIcon className="size-5 text-muted-foreground" />,
};

function Check({ state, children }: { state: CheckState; children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span>{children}</span>
      {CHECK_ICONS[state]}
    </li>
  );
}

interface SubmitPostDialogProps {
  campaign: Campaign;
  trigger: ReactElement;
}

export function SubmitPostDialog({ campaign, trigger }: SubmitPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const inputId = useId();
  const queryClient = useQueryClient();
  const schema = useMemo(() => postSubmissionSchemaFor(campaign.platform), [campaign.platform]);
  const { register, handleSubmit, reset, control } = useForm<PostSubmissionInput, unknown, { postUrl: string }>({
    resolver: zodResolver(schema),
    defaultValues: { postUrl: "" },
  });
  const postUrl = useWatch({ control, name: "postUrl" });
  const linkValid = normalizePostUrl(postUrl, campaign.platform) !== null;
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const firstRung = campaign.milestones[0];
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;
  const spentPercent = Math.min(100, (campaign.spent / campaign.budget) * 100);

  const submit = useMutation({
    mutationFn: (input: PostSubmissionInput) => api.submitPost(campaign._id, input),
    onSuccess: () => {
      toast.success("Post submitted. You'll be paid as its views cross each milestone.");
      reset();
      setAccepted(false);
      setOpen(false);
      return invalidateQueryRoots(queryClient, "submissions", "campaigns", "analytics");
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === "CONFLICT") {
        setDuplicate(true);
      }
      toast.error(error.message);
    },
  });

  const onSubmit = handleSubmit((input) => submit.mutate(input));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDuplicate(false);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="flex gap-4 border-b p-5">
          <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-44">
            <CampaignCover campaign={campaign} sizes="176px" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <DialogTitle className="text-lg leading-snug">{campaign.name}</DialogTitle>
            <DialogDescription className="text-sm">
              {firstRung && `${formatRupees(firstRung.payout)} at ${formatViews(firstRung.views)} views · `}up to{" "}
              {formatRupees(topPayout)} per post
            </DialogDescription>
            <span className="flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs tabular-nums">
              <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-wl-red" style={{ width: `${spentPercent}%` }} />
              </span>
              {formatRupeesCompact(campaign.spent)}/{formatRupeesCompact(campaign.budget)}
            </span>
          </div>
        </div>

        <form id={`submit-${campaign._id}`} onSubmit={onSubmit} noValidate className="flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="font-medium">
              Submit post link
            </label>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
              <PlatformIcon className="size-3.5" /> {PLATFORM_LABELS[campaign.platform]}
            </span>
          </div>
          <Input
            id={inputId}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder={POST_URL_PLACEHOLDERS[campaign.platform]}
            className="h-12 text-base"
            {...register("postUrl", { onChange: () => setDuplicate(false) })}
          />
          <ul className="flex flex-col gap-3">
            <Check state={postUrl ? (linkValid ? "pass" : "fail") : "pending"}>
              Link to a public {PLATFORM_LABELS[campaign.platform]} post
            </Check>
            <Check state={duplicate ? "fail" : "pending"}>Not already submitted to any campaign</Check>
            <Check state={campaign.status === "active" && campaign.remaining > 0 ? "pass" : "fail"}>
              Campaign is accepting posts
            </Check>
          </ul>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 size-4 accent-wl-lime"
            />
            I&apos;ve read the brief and understand posts that don&apos;t follow it may not be paid.
          </label>
        </form>

        <div className="grid grid-cols-2 gap-3 border-t p-5">
          <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" size="lg" form={`submit-${campaign._id}`} disabled={!linkValid || !accepted || submit.isPending}>
            {submit.isPending && <LoaderCircleIcon className="animate-spin" />}
            Submit post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
