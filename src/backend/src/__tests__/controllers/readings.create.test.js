// src/__tests__/controllers/readings.create.test.js
jest.mock("../../lib/storage.service.js", () => ({
  uploadBuffer: jest.fn().mockResolvedValue("u1/abc.pdf"),
  publicUrl: jest.fn().mockReturnValue("https://fake.cdn/u1/abc.pdf"),
}));

jest.mock("../../models/Reading.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(() => ({ sort: jest.fn().mockReturnThis(), lean: jest.fn() })),
  },
}));

import Reading from "../../models/Reading.js";
import { uploadBuffer, publicUrl } from "../../lib/storage.service.js";
import { createReading, listMyReadings } from "../../controllers/reading.controller.js";
import { fakeReqRes } from "../helpers/test-utils.helper.js";

describe("reading.controller.createReading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_BUCKET_LECTURAS = "lecturas-test";
  });

  test("400 si no hay archivo", async () => {
    const { req, res } = fakeReqRes({ titulo: "T2", descripcion: "" });
    req.userId = "u1";
    const next = jest.fn();

    await createReading(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.data.ok).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  test("sube archivo con uploadBuffer y responde 201 con url pública", async () => {
    Reading.create.mockResolvedValue({
      bucket: "lecturas-test",
      objectPath: "u1/abc.pdf",
      mime: "application/pdf",
      size: 123,
      toObject() { return { _id: "r2", titulo: "T2", descripcion: "D2" }; },
    });

    const { req, res } = fakeReqRes({ titulo: "T2", descripcion: "D2" });
    req.userId = "u1";
    req.file = {
      buffer: Buffer.from("x"),
      originalname: "a.pdf",
      mimetype: "application/pdf",
      size: 123,
    };
    const next = jest.fn();

    await createReading(req, res, next);

    expect(uploadBuffer).toHaveBeenCalledWith({
      bucket: "lecturas-test",
      path: expect.stringMatching(/^u1\/.*\.pdf$/),
      buffer: expect.any(Buffer),
      contentType: "application/pdf",
    });
    expect(Reading.create).toHaveBeenCalledWith(expect.objectContaining({
      titulo: "T2",
      descripcion: "D2",
      bucket: "lecturas-test",
      objectPath: "u1/abc.pdf",
      createdBy: "u1",
    }));
    expect(publicUrl).toHaveBeenCalledWith({ bucket: "lecturas-test", path: "u1/abc.pdf" });
    expect(res.statusCode).toBe(201);
    expect(res.data.ok).toBe(true);
    expect(res.data.reading.url).toBe("https://fake.cdn/u1/abc.pdf");
    expect(next).not.toHaveBeenCalled();
  });

  test("error en DB => llama next(e)", async () => {
    Reading.create.mockRejectedValue(new Error("db down"));

    const { req, res } = fakeReqRes({ titulo: "X", descripcion: "" });
    req.userId = "u1";
    req.file = { buffer: Buffer.from("x"), originalname: "a.bin", mimetype: "application/octet-stream", size: 1 };
    const next = jest.fn();

    await createReading(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // opcional: ejemplo de list
  test("listMyReadings devuelve urls públicas", async () => {
    const docs = [{ _id:"r1", bucket:"lecturas-test", objectPath:"u1/abc.pdf" }];
    Reading.find = jest.fn(() => ({
      sort: () => ({ lean: () => Promise.resolve(docs) })
    }));
    const { req, res } = fakeReqRes({}, { userId: "u1" });
    const next = jest.fn();

    await listMyReadings(req, res, next);

    expect(publicUrl).toHaveBeenCalledWith({ bucket:"lecturas-test", path:"u1/abc.pdf" });
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
  });
});
