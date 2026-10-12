import { Router } from "express";

import { authenticate, getAuthUser, requireRole } from "../middleware/auth";
import { getBrandAnalytics, getCreatorAnalytics } from "../services/analytics.service";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get("/creator", requireRole("creator"), async (req, res, next) => {
  try {
    const analytics = await getCreatorAnalytics(getAuthUser(req)._id);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/brand", requireRole("brand"), async (req, res, next) => {
  try {
    const analytics = await getBrandAnalytics(getAuthUser(req)._id);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});
