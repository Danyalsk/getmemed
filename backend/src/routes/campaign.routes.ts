import { Router } from "express";

import {
  brandCampaignsQuerySchema,
  createCampaignSchema,
  liveCampaignsQuerySchema,
  updateCampaignStatusSchema,
} from "../contracts/campaign";
import { idParamsSchema } from "../contracts/common";
import { submissionsQuerySchema } from "../contracts/submission";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import {
  createCampaign,
  findOwnedCampaign,
  listBrandCampaigns,
  listLiveCampaignsJson,
  updateCampaignStatus,
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
  const query = brandCampaignsQuerySchema.parse(req.query);
  const result = await listBrandCampaigns(requireUser(req)._id, query);
  res.json(result);
});

campaignRouter.get("/live", requireRole("creator"), async (req, res) => {
  const query = liveCampaignsQuerySchema.parse(req.query);
  const body = await listLiveCampaignsJson(query);
  res.type("json").send(body);
});

campaignRouter.get("/:id", requireRole("brand"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const campaign = await findOwnedCampaign(requireUser(req)._id, id);
  res.json(campaign);
});

campaignRouter.patch("/:id/status", requireRole("brand"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const { status } = updateCampaignStatusSchema.parse(req.body);
  const campaign = await updateCampaignStatus(requireUser(req)._id, id, status);
  res.json(campaign);
});

campaignRouter.get("/:id/submissions", requireRole("brand"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const query = submissionsQuerySchema.parse(req.query);
  const result = await listCampaignSubmissions(requireUser(req)._id, id, query);
  res.json(result);
});

campaignRouter.post("/:id/submissions", requireRole("creator"), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const submission = await createSubmission(requireUser(req)._id, id, req.body);
  res.status(201).json(submission);
});
