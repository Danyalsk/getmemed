import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { env } from "../config/env";
import { changePasswordSchema, loginSchema, signupSchema, updateProfileSchema } from "../contracts/auth";
import type { ApiError } from "../contracts/common";
import { authenticate, getAuthUser } from "../middleware/auth";
import { changePassword, findUserById, login, signup, updateProfile } from "../services/auth.service";

export const authRouter = Router();

const rateLimitedBody: ApiError = {
  error: { code: "RATE_LIMITED", message: "Too many attempts, please try again in a few minutes" },
};

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: rateLimitedBody,
  skip: () => env.NODE_ENV === "test",
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
    const user = await findUserById(getAuthUser(req)._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/me", authenticate, async (req, res, next) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const user = await updateProfile(getAuthUser(req)._id, input);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/password", authenticate, credentialsLimiter, async (req, res, next) => {
  try {
    const input = changePasswordSchema.parse(req.body);
    await changePassword(getAuthUser(req)._id, input);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
