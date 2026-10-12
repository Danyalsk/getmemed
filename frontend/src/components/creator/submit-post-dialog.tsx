"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useMemo, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";
import { postSubmissionSchemaFor, type PostSubmissionInput } from "@contracts/submission";

import { CampaignCover } from "@/components/campaign-cover";
import { TextField } from "@/components/forms/text-field";
import { MilestoneLadder } from "@/components/milestone-ladder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiRequestError, api } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { queryKeys } from "@/lib/queries";

const POST_URL_PLACEHOLDERS = {
  instagram: "https://www.instagram.com/reel/…",
  youtube: "https://youtube.com/shorts/…",
} satisfies Record<Campaign["platform"], string>;

interface SubmitPostDialogProps {
  campaign: Campaign;
  trigger: ReactElement;
}

export function SubmitPostDialog({ campaign, trigger }: SubmitPostDialogProps) {
  const [open, setOpen] = useState(false);
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

  const submit = useMutation({
    mutationFn: (input: PostSubmissionInput) => api.submitPost(campaign._id, input),
    onSuccess: () => {
      toast.success("Post submitted. Earnings update as views come in.");
      reset();
      setOpen(false);
      return queryClient.invalidateQueries({ queryKey: queryKeys.submissions });
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === "CONFLICT") {
        setError("postUrl", { message: error.message });
      } else {
        toast.error(error.message);
      }
    },
  });

  const onSubmit = handleSubmit((input) => submit.mutate(input));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-5 overflow-hidden sm:max-w-lg">
        <div className="relative -mx-4 -mt-4 aspect-video">
          <CampaignCover campaign={campaign} sizes="512px" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-lg">{campaign.name}</DialogTitle>
          <DialogDescription>
            by {campaign.brand.name} · {formatRupees(campaign.remaining)} budget left
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Payout milestones</span>
          <MilestoneLadder milestones={campaign.milestones} />
        </div>
        <p className="text-sm text-muted-foreground">
          Post on {PLATFORM_LABELS[campaign.platform]}, then paste the public link below. Each post can only be
          submitted once, and you earn the highest milestone its views reach.
        </p>
        <form id={`submit-${campaign._id}`} onSubmit={onSubmit} noValidate>
          <TextField
            label="Post link"
            type="url"
            inputMode="url"
            placeholder={POST_URL_PLACEHOLDERS[campaign.platform]}
            error={errors.postUrl}
            {...register("postUrl")}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`submit-${campaign._id}`} disabled={submit.isPending}>
            {submit.isPending && <LoaderCircleIcon className="animate-spin" />}
            Submit post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
