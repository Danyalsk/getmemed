import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth.routes";
import { campaignRouter } from "./routes/campaign.routes";
import { submissionRouter } from "./routes/submission.routes";

export function createApp() {
  const app = express();

  // Render/Vercel sit behind one proxy hop; needed for correct client IPs in rate limiting.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/campaigns", campaignRouter);
  app.use("/api/submissions", submissionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
