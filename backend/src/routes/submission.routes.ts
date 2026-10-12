import { Router, type Response } from "express";

import { idParamsSchema } from "../contracts/common";
import {
  updateViewsSchema,
  type CreatorSubmissions,
  type UpdateViewsResponse,
} from "../contracts/submission";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import { listCreatorSubmissions, updateViews } from "../services/submission.service";

export const submissionRouter = Router();

submissionRouter.get(
  "/mine",
  authenticate,
  requireRole("creator"),
  async (req, res: Response<CreatorSubmissions>) => {
    res.json(await listCreatorSubmissions(requireUser(req).id));
  },
);

// Simulates the platform pushing fresh view counts, so it is intentionally unauthenticated.
submissionRouter.patch("/:id/views", async (req, res: Response<UpdateViewsResponse>) => {
  const { id } = idParamsSchema.parse(req.params);
  res.json(await updateViews(id, updateViewsSchema.parse(req.body)));
});
