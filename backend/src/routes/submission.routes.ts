import { Router, type Response } from "express";

import type { CreatorSubmissions } from "../contracts/submission";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import { listCreatorSubmissions } from "../services/submission.service";

export const submissionRouter = Router();

submissionRouter.get(
  "/mine",
  authenticate,
  requireRole("creator"),
  async (req, res: Response<CreatorSubmissions>) => {
    res.json(await listCreatorSubmissions(requireUser(req).id));
  },
);
