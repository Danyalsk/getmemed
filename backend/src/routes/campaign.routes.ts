import { Router } from "express";

import {
  brandCampaignsQuerySchema,
  createCampaignSchema,
  liveCampaignsQuerySchema,
  updateCampaignStatusSchema,
} from "../contracts/campaign";
import { idParamsSchema } from "../contracts/common";
import { submissionsQuerySchema } from "../contracts/submission";
import { authenticate, requireRole, getAuthUser } from "../middleware/auth";
import {
  createCampaign,
  findBrandCampaign,
  listBrandCampaigns,
  listLiveCampaignsJson,
  updateCampaignStatus,
} from "../services/campaign.service";
import { createSubmission, listCampaignSubmissions } from "../services/submission.service";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.post("/", requireRole("brand"), async (req, res, next) => {
  try {
    const input = createCampaignSchema.parse(req.body);
    const campaign = await createCampaign(getAuthUser(req)._id, input);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

campaignRouter.get("/mine", requireRole("brand"), async (req, res, next) => {
  try {
    const query = brandCampaignsQuerySchema.parse(req.query);
    const result = await listBrandCampaigns(getAuthUser(req)._id, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

campaignRouter.get("/live", requireRole("creator"), async (req, res, next) => {
  try {
    const query = liveCampaignsQuerySchema.parse(req.query);
    const body = await listLiveCampaignsJson(query);
    res.type("json").send(body);
  } catch (error) {
    next(error);
  }
});

campaignRouter.get("/:id", requireRole("brand"), async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const campaign = await findBrandCampaign(getAuthUser(req)._id, id);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

campaignRouter.patch("/:id/status", requireRole("brand"), async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const { status } = updateCampaignStatusSchema.parse(req.body);
    const campaign = await updateCampaignStatus(getAuthUser(req)._id, id, status);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

campaignRouter.get("/:id/submissions", requireRole("brand"), async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const query = submissionsQuerySchema.parse(req.query);
    const result = await listCampaignSubmissions(getAuthUser(req)._id, id, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

campaignRouter.post("/:id/submissions", requireRole("creator"), async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const submission = await createSubmission(getAuthUser(req)._id, id, req.body);
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});
