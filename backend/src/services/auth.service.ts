import bcrypt from "bcryptjs";

import type { AuthResponse, LoginInput, PublicUser, SignupInput } from "../contracts/auth";
import { AppError } from "../lib/errors";
import { signToken } from "../lib/jwt";
import { UserModel, type UserDocument } from "../models/user.model";

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown so both paths take the same time.
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", BCRYPT_ROUNDS);

function toPublicUser(user: UserDocument): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function toAuthResponse(user: UserDocument): AuthResponse {
  const publicUser = toPublicUser(user);
  return { token: signToken(publicUser), user: publicUser };
}

export async function signup(input: SignupInput): Promise<AuthResponse> {
  if (await UserModel.exists({ email: input.email })) {
    throw AppError.conflict("An account with this email already exists");
  }
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
  });
  return toAuthResponse(user);
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    throw AppError.unauthorized("Invalid email or password");
  }
  return toAuthResponse(user);
}

export async function getUser(id: string): Promise<PublicUser> {
  const user = await UserModel.findById(id);
  if (!user) {
    throw AppError.unauthorized("Account no longer exists");
  }
  return toPublicUser(user);
}
