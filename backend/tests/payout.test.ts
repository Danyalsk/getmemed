import type { Milestone } from "../src/contracts/campaign";
import { calculateEntitledPayout, calculatePayoutDue } from "../src/services/payout";

const ladder: Milestone[] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
  { views: 100_000, payout: 5_000 },
];

describe("calculateEntitledPayout", () => {
  it.each([
    [0, 0],
    [9_999, 0],
    [10_000, 500],
    [49_999, 500],
    [50_000, 2_000],
    [99_999, 2_000],
    [100_000, 5_000],
    [5_000_000, 5_000],
  ])("%i views earns ₹%i", (views, expected) => {
    expect(calculateEntitledPayout(ladder, views)).toBe(expected);
  });

  it("pays only the highest milestone when several are crossed at once", () => {
    expect(calculateEntitledPayout(ladder, 120_000)).toBe(5_000);
  });

  it("does not depend on ladder order", () => {
    expect(calculateEntitledPayout([...ladder].reverse(), 60_000)).toBe(2_000);
  });

  it("returns 0 for an empty ladder", () => {
    expect(calculateEntitledPayout([], 1_000_000)).toBe(0);
  });
});

describe("calculatePayoutDue", () => {
  it("pays the full entitlement when budget allows", () => {
    expect(calculatePayoutDue({ entitled: 2_000, alreadyPaid: 0, remainingBudget: 10_000 })).toBe(2_000);
  });

  it("pays only the difference after an earlier milestone was paid", () => {
    expect(calculatePayoutDue({ entitled: 5_000, alreadyPaid: 500, remainingBudget: 10_000 })).toBe(4_500);
  });

  it("pays nothing when the same entitlement is processed again", () => {
    expect(calculatePayoutDue({ entitled: 2_000, alreadyPaid: 2_000, remainingBudget: 10_000 })).toBe(0);
  });

  it("caps the payout at the remaining budget", () => {
    expect(calculatePayoutDue({ entitled: 5_000, alreadyPaid: 2_000, remainingBudget: 1_200 })).toBe(1_200);
  });

  it("pays exactly the remaining budget when it matches what is owed", () => {
    expect(calculatePayoutDue({ entitled: 2_000, alreadyPaid: 0, remainingBudget: 2_000 })).toBe(2_000);
  });

  it("pays nothing once the budget is exhausted", () => {
    expect(calculatePayoutDue({ entitled: 5_000, alreadyPaid: 0, remainingBudget: 0 })).toBe(0);
  });

  it("never pays a negative amount", () => {
    expect(calculatePayoutDue({ entitled: 500, alreadyPaid: 2_000, remainingBudget: 10_000 })).toBe(0);
    expect(calculatePayoutDue({ entitled: 500, alreadyPaid: 0, remainingBudget: -100 })).toBe(0);
  });

  it("keeps cumulative payouts within budget across a full ladder climb", () => {
    const budget = 3_000;
    let spent = 0;
    let paid = 0;
    for (const views of [10_000, 50_000, 100_000]) {
      const pay = calculatePayoutDue({
        entitled: calculateEntitledPayout(ladder, views),
        alreadyPaid: paid,
        remainingBudget: budget - spent,
      });
      spent += pay;
      paid += pay;
    }
    expect(spent).toBe(budget);
    expect(paid).toBe(budget);
  });
});
