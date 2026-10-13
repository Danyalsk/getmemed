import mongoose from "mongoose";

import { env } from "../src/config/env";

// Campaigns created before end dates existed run for 30 days from creation.
async function backfillEndDates(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  const result = await mongoose.connection
    .collection("campaigns")
    .updateMany({ endsAt: { $exists: false } }, [
      { $set: { endsAt: { $dateAdd: { startDate: "$createdAt", unit: "day", amount: 30 } } } },
    ]);
  console.log(`Set an end date on ${result.modifiedCount} campaigns`);
}

backfillEndDates()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
