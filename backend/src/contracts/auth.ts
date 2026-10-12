import { z } from "zod";

import { objectIdSchema, roleSchema } from "./common";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: emailSchema,
  password: z.string().min(8, "Use at least 8 characters").max(72),
  role: roleSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const publicUserSchema = z.object({
  _id: objectIdSchema,
  name: z.string(),
  email: z.string(),
  role: roleSchema,
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: publicUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
