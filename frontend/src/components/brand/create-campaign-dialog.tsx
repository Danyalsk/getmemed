"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCampaignSchema, MAX_MILESTONES, type CreateCampaignInput } from "@contracts/campaign";
import { PLATFORM_LABELS, platformSchema, type Platform } from "@contracts/common";

import { ChoiceTiles, type Choice } from "@/components/forms/choice-tiles";
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
import { FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { api } from "@/lib/api";
import { PLATFORM_ICONS } from "@/lib/platforms";
import { queryKeys } from "@/lib/queries";

const PLATFORM_HINTS: Record<Platform, string> = {
  instagram: "Reels and feed posts",
  youtube: "Videos and Shorts",
};

const PLATFORM_CHOICES: readonly Choice<Platform>[] = platformSchema.options.map((platform) => ({
  value: platform,
  label: PLATFORM_LABELS[platform],
  hint: PLATFORM_HINTS[platform],
  icon: PLATFORM_ICONS[platform],
}));

const DEFAULT_VALUES: CreateCampaignInput = {
  name: "",
  platform: "instagram",
  budget: 50_000,
  milestones: [
    { views: 10_000, payout: 500 },
    { views: 50_000, payout: 2_000 },
    { views: 100_000, payout: 5_000 },
  ],
};

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const milestones = useFieldArray({ control, name: "milestones" });
  const ladderError = errors.milestones?.root ?? errors.milestones;

  const create = useMutation({
    mutationFn: api.createCampaign,
    onSuccess: (campaign) => {
      toast.success(`${campaign.name} is live`);
      reset(DEFAULT_VALUES);
      setOpen(false);
      return queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = handleSubmit((input) => create.mutate(input));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon /> New campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
          <DialogDescription>
            Each post is paid the highest milestone it reaches. Payouts stop once the budget is used up.
          </DialogDescription>
        </DialogHeader>
        <form id="create-campaign" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <TextField
              label="Campaign name"
              placeholder="e.g. Q4 product launch"
              autoComplete="off"
              error={errors.name}
              {...register("name")}
            />
            <Controller
              control={control}
              name="platform"
              render={({ field }) => (
                <ChoiceTiles
                  legend="Platform"
                  name={field.name}
                  choices={PLATFORM_CHOICES}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <TextField
              label="Total budget (₹)"
              description="Payouts across all posts can never exceed this amount."
              type="number"
              inputMode="numeric"
              min={1}
              error={errors.budget}
              {...register("budget", { valueAsNumber: true })}
            />
            <FieldSet>
              <FieldLegend variant="label">Payout milestones</FieldLegend>
              <FieldDescription>Views and payouts must increase with each milestone.</FieldDescription>
              <ol className="flex flex-col gap-3">
                {milestones.fields.map((field, index) => (
                  <li key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-3">
                    <TextField
                      label={`Views — milestone ${index + 1}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      error={errors.milestones?.[index]?.views}
                      {...register(`milestones.${index}.views`, { valueAsNumber: true })}
                    />
                    <TextField
                      label="Payout (₹)"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      error={errors.milestones?.[index]?.payout}
                      {...register(`milestones.${index}.payout`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      aria-label={`Remove milestone ${index + 1}`}
                      disabled={milestones.fields.length === 1}
                      onClick={() => milestones.remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ol>
              <FieldError errors={[ladderError]} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={milestones.fields.length >= MAX_MILESTONES}
                onClick={() => {
                  const last = getValues("milestones").at(-1);
                  milestones.append({ views: (last?.views ?? 0) * 2 || 10_000, payout: (last?.payout ?? 0) * 2 || 500 });
                }}
              >
                <PlusIcon /> Add milestone
              </Button>
            </FieldSet>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-campaign" disabled={create.isPending}>
            {create.isPending && <LoaderCircleIcon className="animate-spin" />}
            Create campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
