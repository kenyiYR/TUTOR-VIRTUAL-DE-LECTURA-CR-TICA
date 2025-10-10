jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return { ...actual, connection: { readyState: 1 } };
});

import request from "supertest";
import { app } from "../index.js";

test("GET /db/health indica conectado", async () => {
  const res = await request(app).get("/db/health");
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.state).toBe("connected");
});
