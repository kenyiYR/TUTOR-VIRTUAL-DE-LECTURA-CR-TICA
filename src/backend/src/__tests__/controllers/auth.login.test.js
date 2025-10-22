// src/__tests__/controllers/auth.login.test.js
jest.mock("../../models/User.js");
jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue("hashed"),
}));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn(() => "FAKE.JWT.TOKEN") }));

import User from "../../models/User.js";
import { login } from "../../controllers/auth.controller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fakeReqRes } from "../helpers/test-utils.helper.js";

describe("AuthController.login", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "testsecret";
    jest.clearAllMocks();
  });

  test("login OK devuelve token y user", async () => {
    User.findOne = jest.fn().mockResolvedValue({
      _id: "u1",
      email: "ana@example.com",
      rol: "docente",
      passwordHash: "hash",
      toJSON() { return { _id: "u1", email: "ana@example.com", rol: "docente" }; },
    });

    const { req, res } = fakeReqRes({ email: "Ana@Example.COM", password: "secreto123" });
    const next = jest.fn();

    await login(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: "ana@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith("secreto123", "hash");
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(res.data.token).toBe("FAKE.JWT.TOKEN");
    expect(res.data.user.email).toBe("ana@example.com");
    expect(next).not.toHaveBeenCalled();
  });

  test("credenciales inválidas => 401", async () => {
    User.findOne = jest.fn().mockResolvedValue({
      _id: "u1",
      email: "ana@example.com",
      rol: "docente",
      passwordHash: "hash",
      toJSON() { return { _id: "u1", email: "ana@example.com", rol: "docente" }; },
    });
    bcrypt.compare.mockResolvedValue(false);

    const { req, res } = fakeReqRes({ email: "ana@example.com", password: "xxx" });
    const next = jest.fn();

    await login(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.data.ok).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  test("usuario no existe => 404", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const { req, res } = fakeReqRes({ email: "no@no.com", password: "whatever" });
    const next = jest.fn();

    await login(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: "no@no.com" });
    expect(res.statusCode).toBe(404);
    expect(res.data.ok).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });
});
