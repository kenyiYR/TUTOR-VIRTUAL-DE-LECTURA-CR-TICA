// Mock mínimo para que ningún import de supabase valide envs
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: {}, storage: { from: () => ({}) } })
}));

jest.mock("../../models/Assignment.js");
jest.mock("../../models/Reading.js");
jest.mock("../../models/User.js");

import Assignment from "../../models/Assignment.js";
import Reading from "../../models/Reading.js";
import { assignReading } from "../../controllers/assignment.controller.js";
import { fakeReqRes } from "../helpers/test-utils.helper.js";

describe("AssignmentsController.assign", () => {
  beforeEach(() => jest.clearAllMocks());

  test("asigna lectura OK", async () => {
    Reading.findById = jest.fn().mockResolvedValue({ _id: "r1" });
    Assignment.create = jest.fn().mockResolvedValue({
      _id: "a1", reading: "r1", student: "u2", status: "assigned"
    });

    const { req, res } = fakeReqRes({ readingId: "r1", studentId: "u2", dueDate: "2025-12-01T00:00:00.000Z" });
    req.user = { id: "u1", rol: "docente" };
    const next = jest.fn();

    await assignReading(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res.data.assignment.status).toBe("assigned");
    expect(next).not.toHaveBeenCalled();
  });

  test("rechaza si no es docente => 403", async () => {
    const { req, res } = fakeReqRes({ readingId: "r1", studentId: "u2" });
    req.user = { id: "uX", rol: "estudiante" };
    const next = jest.fn();

    await assignReading(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("lectura inexistente => 404", async () => {
    Reading.findById = jest.fn().mockResolvedValue(null);

    const { req, res } = fakeReqRes({ readingId: "rX", studentId: "u2" });
    req.user = { id: "u1", rol: "docente" };
    const next = jest.fn();

    await assignReading(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });

  test("error inesperado => llama next(e)", async () => {
    Reading.findById = jest.fn().mockRejectedValue(new Error("boom"));
    const { req, res } = fakeReqRes({ readingId: "r1", studentId: "u2" });
    req.user = { id: "u1", rol: "docente" };
    const next = jest.fn();

    await assignReading(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
