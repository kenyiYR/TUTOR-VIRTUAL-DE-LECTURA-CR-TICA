import request from "supertest";
import { app } from "../index.js";

describe("GET /health", () => {
  it("responde ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
