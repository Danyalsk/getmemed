import jwt from "jsonwebtoken";
import { z } from "zod";

import type { PublicUser } from "../contracts/auth";
import { objectIdSchema, roleSchema } from "../contracts/common";
import { env } from "../config/env";

export type AuthUser = Pick<PublicUser, "id" | "role">;

const claimsSchema = z.object({ sub: objectIdSchema, role: roleSchema });

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_TTL_SECONDS,
    algorithm: "HS256",
  });
}

/** Throws when the token is malformed, expired or signed with another key. */
export function verifyToken(token: string): AuthUser {
  const claims = claimsSchema.parse(jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }));
  return { id: claims.sub, role: claims.role };
}
