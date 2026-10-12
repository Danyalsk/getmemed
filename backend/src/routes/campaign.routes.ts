import { Router } from "express";

import { createCampaignSchema } from "../contracts/campaign";
import { idParamsSchema } from "../contracts/common";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import {
  closeCampaign,
  createCampaign,
  listBrandCampaigns,
  listLiveCampaignsJson,
} from "../services/campaign.service";
import { createSubmission, listCampaignSubmissions } from "../services/submission.service";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.post("/", requireRole("brand"), async (req, res) => {
  const input = createCampaignSchema.parse(req.body);
  const campaign = await createCampaign(requireUser(req)._id, input);
  res.status(201).json(campaign);
});

campaignRouter.get("/mine", requireRole("brand"), async (req, res) => {
  const campaigns = await listBrandCampaigns(requireUser(req)._id);
  res.json(campaigns);
});

campaignRouter.get("/live", requireRole("creator"), async (_req, res) => {
  const body = await listLiveCampaignsJson();
  res.type("json").send(body);
});

campaignRouter.patch("/:id/close", requireRole("brand"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const campaign = await closeCampaign(requireUser(req)._id, id);
  res.json(campaign);
});

campaignRouter.get("/:id/submissions", requireRole("brand"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const submissions = await listCampaignSubmissions(requireUser(req)._id, id);
  res.json(submissions);
});

campaignRouter.post("/:id/submissions", requireRole("creator"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const submission = await createSubmission(requireUser(req)._id, id, req.body);
  res.status(201).json(submission);
});
