import type { Milestone } from "../contracts/campaign";

/**
 * What a post has earned in total: the payout of the highest milestone its
 * views have reached. Milestones are never summed, so crossing several rungs
 * in one update still pays only the top one.
 */
export function entitledPayout(ladder: readonly Milestone[], views: number): number {
  return ladder.reduce((best, rung) => (views >= rung.views ? Math.max(best, rung.payout) : best), 0);
}

interface PayoutDueInput {
  entitled: number;
  alreadyPaid: number;
  remainingBudget: number;
}

/**
 * Amount to pay right now: the unpaid part of the entitlement, capped by what
 * the campaign has left. Paying only the difference makes repeated updates with
 * the same view count pay nothing extra.
 */
export function payoutDue({ entitled, alreadyPaid, remainingBudget }: PayoutDueInput): number {
  const owed = Math.max(0, entitled - alreadyPaid);
  return Math.min(owed, Math.max(0, remainingBudget));
}
