import { detectSpike } from "../src/services/spike";

const thresholds = { minDelta: 5_000, viewsPerHour: 20_000 };
const now = new Date("2026-10-12T12:00:00Z");
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000);

describe("detectSpike", () => {
  it("ignores small gains even when fast", () => {
    expect(detectSpike({ previousViews: 0, views: 4_999, since: minutesAgo(1), now }, thresholds)).toBeNull();
  });

  it("ignores large gains spread over a long time", () => {
    expect(detectSpike({ previousViews: 0, views: 100_000, since: minutesAgo(24 * 60), now }, thresholds)).toBeNull();
  });

  it("flags large gains that arrive quickly", () => {
    const reason = detectSpike({ previousViews: 10_000, views: 60_000, since: minutesAgo(30), now }, thresholds);
    expect(reason).toBe("Gained 50,000 views in 30 min (~1,00,000/hour)");
  });

  it("treats near-simultaneous updates as a one minute window", () => {
    const reason = detectSpike({ previousViews: 0, views: 6_000, since: now, now }, thresholds);
    expect(reason).toContain("in 1 min");
  });

  it("does not flag when views did not grow", () => {
    expect(detectSpike({ previousViews: 50_000, views: 50_000, since: minutesAgo(1), now }, thresholds)).toBeNull();
  });
});
