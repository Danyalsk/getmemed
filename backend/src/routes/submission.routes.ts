import { Router } from "express";

import { idParamsSchema } from "../contracts/common";
import { submissionsQuerySchema, updateViewsSchema } from "../contracts/submission";
import { authenticate, requireRole, getAuthUser } from "../middleware/auth";
import { listCreatorSubmissions, recordViewsAndPayout } from "../services/submission.service";

export const submissionRouter = Router();

submissionRouter.get("/mine", authenticate, requireRole("creator"), async (req, res, next) => {
  try {
    const query = submissionsQuerySchema.parse(req.query);
    const result = await listCreatorSubmissions(getAuthUser(req)._id, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

submissionRouter.patch("/:id/views", async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const input = updateViewsSchema.parse(req.body);
    const result = await recordViewsAndPayout(id, input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
