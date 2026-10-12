import { Router, type Response } from "express";
import { rateLimit } from "express-rate-limit";

import { loginSchema, signupSchema, type AuthResponse, type PublicUser } from "../contracts/auth";
import type { ApiError } from "../contracts/common";
import { authenticate, requireUser } from "../middleware/auth";
import { getUser, login, signup } from "../services/auth.service";

export const authRouter = Router();

const rateLimitedBody: ApiError = {
  error: { code: "RATE_LIMITED", message: "Too many attempts, please try again in a few minutes" },
};

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: rateLimitedBody,
});

authRouter.post("/signup", credentialsLimiter, async (req, res: Response<AuthResponse>) => {
  res.status(201).json(await signup(signupSchema.parse(req.body)));
});

authRouter.post("/login", credentialsLimiter, async (req, res: Response<AuthResponse>) => {
  res.json(await login(loginSchema.parse(req.body)));
});

authRouter.get("/me", authenticate, async (req, res: Response<PublicUser>) => {
  res.json(await getUser(requireUser(req).id));
});
