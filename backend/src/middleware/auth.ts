import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { Role } from "../contracts/common";
import { AppError } from "../lib/errors";
import { verifyToken, type AuthUser } from "../lib/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized();
  }
  try {
    req.user = verifyToken(token);
  } catch {
    throw AppError.unauthorized("Session expired or invalid, please log in again");
  }
  next();
}

export function requireRole(role: Role): RequestHandler {
  return (req, _res, next) => {
    if (requireUser(req).role !== role) {
      throw AppError.forbidden(`Only ${role}s can do this`);
    }
    next();
  };
}

/** Narrows `req.user` for handlers mounted behind `authenticate`. */
export function requireUser(req: Request): AuthUser {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}
