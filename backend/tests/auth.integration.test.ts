import request from "supertest";

import { authResponseSchema } from "../src/contracts/auth";
import { app } from "./support/api";
import { useTestDatabase } from "./support/database";

jest.setTimeout(60_000);
useTestDatabase();

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
