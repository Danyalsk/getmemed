import jwt from "jsonwebtoken";
import { z } from "zod";

import type { PublicUser } from "../contracts/auth";
import { objectIdSchema, roleSchema } from "../contracts/common";
import { env } from "../config/env";

export type AuthUser = Pick<PublicUser, "_id" | "role">;

const claimsSchema = z.object({ sub: objectIdSchema, role: roleSchema });

export function signAuthToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user._id,
    expiresIn: env.JWT_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyAuthToken(token: string): AuthUser {
  const claims = claimsSchema.parse(jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }));
  return { _id: claims.sub, role: claims.role };
}
