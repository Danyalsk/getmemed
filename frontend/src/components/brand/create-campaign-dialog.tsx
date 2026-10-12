"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCampaignSchema, MAX_MILESTONES, type CreateCampaignInput } from "@contracts/campaign";
import { PLATFORM_LABELS, type Platform } from "@contracts/common";

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
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries";

const PLATFORM_CHOICES: readonly Choice<Platform>[] = [
  { value: "instagram", label: PLATFORM_LABELS.instagram, hint: "Reels & posts", colorClass: "bg-wl-pink" },
  { value: "youtube", label: PLATFORM_LABELS.youtube, hint: "Videos & Shorts", colorClass: "bg-wl-yellow" },
];

const DEFAULT_VALUES: CreateCampaignInput = {
  name: "",
  platform: "instagram",
  budget: 10_000,
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
      toast.success(`"${campaign.name}" is live`);
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
        <Button size="lg">
          <PlusIcon /> New campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Launch a campaign</DialogTitle>
          <DialogDescription>
            Creators earn the highest milestone their post crosses. Payouts stop once the budget is
            spent.
          </DialogDescription>
        </DialogHeader>
        <form id="create-campaign" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <TextField label="Campaign name" placeholder="Diwali meme drop" error={errors.name} {...register("name")} />
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
              type="number"
              inputMode="numeric"
              min={1}
              error={errors.budget}
              {...register("budget", { valueAsNumber: true })}
            />
            <FieldSet>
              <FieldLegend variant="label">Milestone ladder</FieldLegend>
              <ol className="flex flex-col gap-3">
                {milestones.fields.map((field, index) => (
                  <li key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                    <TextField
                      label={`Views #${index + 1}`}
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
                  milestones.append({
                    views: (last?.views ?? 0) + 50_000,
                    payout: (last?.payout ?? 0) + 1_000,
                  });
                }}
              >
                <PlusIcon /> Add milestone
              </Button>
            </FieldSet>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="create-campaign" disabled={create.isPending}>
            {create.isPending ? "Launching…" : "Launch campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
