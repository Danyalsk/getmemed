import { model, Schema } from "mongoose";

import { roleSchema } from "../contracts/common";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: roleSchema.options, required: true },
  },
  { timestamps: true, versionKey: false },
);

userSchema.set("toJSON", { transform: (_doc, { passwordHash, ...user }) => user });

export const UserModel = model("User", userSchema);
