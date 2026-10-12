import { Router, type Response } from "express";

import { createCampaignSchema, type Campaign } from "../contracts/campaign";
import { idParamsSchema } from "../contracts/common";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import {
  closeCampaign,
  createCampaign,
  listBrandCampaigns,
  listLiveCampaigns,
} from "../services/campaign.service";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.post("/", requireRole("brand"), async (req, res: Response<Campaign>) => {
  const input = createCampaignSchema.parse(req.body);
  res.status(201).json(await createCampaign(requireUser(req).id, input));
});

campaignRouter.get("/mine", requireRole("brand"), async (req, res: Response<Campaign[]>) => {
  res.json(await listBrandCampaigns(requireUser(req).id));
});

campaignRouter.get("/live", requireRole("creator"), async (_req, res: Response<Campaign[]>) => {
  res.json(await listLiveCampaigns());
});

campaignRouter.patch("/:id/close", requireRole("brand"), async (req, res: Response<Campaign>) => {
  const { id } = idParamsSchema.parse(req.params);
  res.json(await closeCampaign(requireUser(req).id, id));
});
