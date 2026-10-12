"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateViewsSchema, type Submission, type UpdateViewsInput } from "@contracts/submission";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { queryKeys } from "@/lib/queries";

/**
 * Stand-in for the platform pushing view counts (PATCH /api/submissions/:id/views),
 * so the payout flow can be tried end to end.
 */
export function SimulateViewsForm({ submission }: { submission: Submission }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateViewsInput>({
    resolver: zodResolver(updateViewsSchema),
    defaultValues: { views: submission.views },
  });

  const update = useMutation({
    mutationFn: (input: UpdateViewsInput) => api.updateViews(submission._id, input),
    onSuccess: ({ paidNow }) => {
      if (paidNow > 0) {
        toast.success(`Milestone hit! ${formatRupees(paidNow)} paid out`);
      } else {
        toast.info("Views updated, no new payout");
      }
      // A payout changes both the creator's earnings and the campaign's remaining budget.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.submissions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = handleSubmit((input) => update.mutate(input));

  return (
    <form onSubmit={onSubmit} noValidate className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          aria-label={`New view count for ${submission.campaign.name}`}
          aria-invalid={errors.views !== undefined}
          className="h-8 w-32"
          {...register("views", { valueAsNumber: true })}
        />
        {errors.views && <span className="text-xs font-semibold text-red-700">{errors.views.message}</span>}
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={update.isPending}>
        Update
      </Button>
    </form>
  );
}
