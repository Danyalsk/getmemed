import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { createApp } from "../src/app";
import { authResponseSchema } from "../src/contracts/auth";

jest.setTimeout(60_000);

const app = createApp();
let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

describe("auth responses", () => {
  it("never expose the password hash", async () => {
    const credentials = { email: "brand@test.dev", password: "password123" };
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ ...credentials, name: "Brand", role: "brand" });
    const login = await request(app).post("/api/auth/login").send(credentials);
    const me = await request(app)
      .get("/api/auth/me")
      .auth(authResponseSchema.parse(login.body).token, { type: "bearer" });

    for (const res of [signup, login, me]) {
      expect(res.status).toBeLessThan(300);
      expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    }
  });
});
