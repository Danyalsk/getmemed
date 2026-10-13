"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useId, useMemo, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";
import { postSubmissionSchemaFor, type PostSubmissionInput } from "@contracts/submission";

import { CampaignCover } from "@/components/campaign-cover";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ApiRequestError, api } from "@/lib/api";
import { formatRupees, formatViews } from "@/lib/format";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { invalidateQueryRoots } from "@/lib/queries";

const POST_URL_PLACEHOLDERS = {
  instagram: "instagram.com/reel/…",
  youtube: "youtube.com/shorts/…",
} satisfies Record<Campaign["platform"], string>;

interface SubmitPostSheetProps {
  campaign: Campaign;
  trigger: ReactElement;
}

export function SubmitPostSheet({ campaign, trigger }: SubmitPostSheetProps) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const inputId = useId();
  const queryClient = useQueryClient();
  const schema = useMemo(() => postSubmissionSchemaFor(campaign.platform), [campaign.platform]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PostSubmissionInput, unknown, { postUrl: string }>({
    resolver: zodResolver(schema),
    defaultValues: { postUrl: "" },
  });
  const PlatformIcon = PLATFORM_ICONS[campaign.platform];
  const platformLabel = PLATFORM_LABELS[campaign.platform];
  const topPayout = campaign.milestones.at(-1)?.payout ?? 0;

  const submit = useMutation({
    mutationFn: (input: PostSubmissionInput) => api.submitPost(campaign._id, input),
    onSuccess: () => {
      toast.success("Post submitted. You'll be paid as its views cross each milestone.");
      reset();
      setOpen(false);
      return invalidateQueryRoots(queryClient, "submissions", "campaigns", "analytics");
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === "CONFLICT") {
        setError("postUrl", { message: error.message });
        return;
      }
      toast.error(error.message);
    },
  });

  const onSubmit = handleSubmit((input) => submit.mutate(input));

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <div className="flex flex-col gap-4 border-b p-5 pr-12">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <CampaignCover campaign={campaign} sizes="448px" />
          </div>
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-lg">{campaign.name}</SheetTitle>
            <SheetDescription>
              {campaign.brand.name} · up to <span className="text-success">{formatRupees(topPayout)}</span> per post
            </SheetDescription>
          </div>
        </div>

        <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
          <Field data-invalid={errors.postUrl !== undefined}>
            <FieldLabel htmlFor={inputId}>{platformLabel} post link</FieldLabel>
            <div className="relative">
              <PlatformIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={inputId}
                type="url"
                inputMode="url"
                autoComplete="off"
                autoFocus
                placeholder={POST_URL_PLACEHOLDERS[campaign.platform]}
                aria-invalid={errors.postUrl !== undefined}
                className="h-11 pl-9"
                {...register("postUrl")}
              />
            </div>
            {!errors.postUrl && (
              <FieldDescription>Paste the link to a public {platformLabel} post you made for this campaign.</FieldDescription>
            )}
            <FieldError errors={[errors.postUrl]} />
          </Field>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">What this post can earn</h3>
            <ol className="flex flex-col divide-y rounded-xl border">
              {campaign.milestones.map((rung) => (
                <li key={rung.views} className="flex items-center justify-between px-4 py-2.5 text-sm tabular-nums">
                  <span className="text-muted-foreground">{formatViews(rung.views)} views</span>
                  <span className="font-semibold text-success">{formatRupees(rung.payout)}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">
              You&apos;re paid the highest milestone reached, while {formatRupees(campaign.remaining)} of budget is left.
            </p>
          </div>
        </form>

        <SheetFooter className="border-t p-5">
          <Button type="submit" size="lg" form={formId} disabled={submit.isPending}>
            {submit.isPending && <LoaderCircleIcon className="animate-spin" />}
            Submit post
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
