import type { Milestone } from "../contracts/campaign";

export function calculateEntitledPayout(ladder: readonly Milestone[], views: number): number {
  return ladder.reduce((best, rung) => (views >= rung.views ? Math.max(best, rung.payout) : best), 0);
}

interface PayoutDueInput {
  entitled: number;
  alreadyPaid: number;
  remainingBudget: number;
}

export function calculatePayoutDue({ entitled, alreadyPaid, remainingBudget }: PayoutDueInput): number {
  const owed = Math.max(0, entitled - alreadyPaid);
  return Math.min(owed, Math.max(0, remainingBudget));
}
