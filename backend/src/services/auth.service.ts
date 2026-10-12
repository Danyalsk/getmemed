import bcrypt from "bcryptjs";

import type { ChangePasswordInput, LoginInput, SignupInput, UpdateProfileInput } from "../contracts/auth";
import type { Role } from "../contracts/common";
import { AppError } from "../lib/errors";
import { signAuthToken } from "../lib/jwt";
import { UserModel } from "../models/user.model";

const BCRYPT_ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", BCRYPT_ROUNDS);

function buildAuthResponse<T extends { id: string; role: Role }>(user: T) {
  const token = signAuthToken({ _id: user.id, role: user.role });
  return { token, user };
}

export async function signup(input: SignupInput) {
  const emailTaken = await UserModel.exists({ email: input.email });
  if (emailTaken) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await UserModel.create({ ...input, passwordHash });
  return buildAuthResponse(user);
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    throw AppError.unauthorized("Invalid email or password");
  }
  return buildAuthResponse(user);
}

export async function findUserById(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.unauthorized("Account no longer exists");
  }
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await UserModel.findByIdAndUpdate(userId, { name: input.name }, { new: true });
  if (!user) {
    throw AppError.unauthorized("Account no longer exists");
  }
  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await UserModel.findById(userId).select("+passwordHash");
  if (!user) {
    throw AppError.unauthorized("Account no longer exists");
  }
  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw AppError.badRequest("Current password is incorrect");
  }
  user.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  await user.save();
}
