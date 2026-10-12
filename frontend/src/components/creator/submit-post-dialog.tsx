"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Campaign } from "@contracts/campaign";
import { PLATFORM_LABELS } from "@contracts/common";
import { postSubmissionSchema, type PostSubmissionInput } from "@contracts/submission";

import { TextField } from "@/components/forms/text-field";
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
import { queryKeys } from "@/lib/queries";

const PLACEHOLDERS = {
  instagram: "https://www.instagram.com/reel/…",
  youtube: "https://youtube.com/shorts/…",
} satisfies Record<Campaign["platform"], string>;

export function SubmitPostDialog({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const schema = useMemo(() => postSubmissionSchema(campaign.platform), [campaign.platform]);
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
      <DialogTrigger asChild>
        <Button>Submit a post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit to {campaign.name}</DialogTitle>
          <DialogDescription>
            Paste the link to your {PLATFORM_LABELS[campaign.platform]} post. Each post can be submitted once.
          </DialogDescription>
        </DialogHeader>
        <form id={`submit-${campaign._id}`} onSubmit={onSubmit} noValidate>
          <TextField
            label="Post link"
            type="url"
            inputMode="url"
            placeholder={PLACEHOLDERS[campaign.platform]}
            error={errors.postUrl}
            {...register("postUrl")}
          />
        </form>
        <DialogFooter>
          <Button type="submit" form={`submit-${campaign._id}`} disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Submit post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
