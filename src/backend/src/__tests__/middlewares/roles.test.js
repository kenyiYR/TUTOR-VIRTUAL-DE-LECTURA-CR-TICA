import { requireRole } from "../../middlewares/roles.js";

test("requireRole responde 401 si no hay usuario", () => {
  const req = {};
  const res = { statusCode: 200, status(c){this.statusCode=c;return this;}, json(d){this.data=d;return this;} };
  const next = jest.fn();
  requireRole("docente")(req, res, next);
  expect(res.statusCode).toBe(401);
});

test("requireRole responde 403 si el rol no coincide", () => {
  const req = { user: { rol: "estudiante" } };
  const res = { statusCode: 200, status(c){this.statusCode=c;return this;}, json(d){this.data=d;return this;} };
  const next = jest.fn();
  requireRole("docente")(req, res, next);
  expect(res.statusCode).toBe(403);
});
