import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { loginSchema, signupSchema } from "../contracts/auth";
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

authRouter.post("/signup", credentialsLimiter, async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    const session = await signup(input);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", credentialsLimiter, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const session = await login(input);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await getUser(requireUser(req)._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
