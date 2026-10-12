import { Router } from "express";

import { idParamsSchema } from "../contracts/common";
import { submissionsQuerySchema, updateViewsSchema } from "../contracts/submission";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import { listCreatorSubmissions, updateViews } from "../services/submission.service";

export const submissionRouter = Router();

submissionRouter.get("/mine", authenticate, requireRole("creator"), async (req, res, next) => {
  try {
    const query = submissionsQuerySchema.parse(req.query);
    const result = await listCreatorSubmissions(requireUser(req)._id, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Simulates the platform pushing fresh view counts, so it is intentionally unauthenticated.
submissionRouter.patch("/:id/views", async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const input = updateViewsSchema.parse(req.body);
    const result = await updateViews(id, input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
