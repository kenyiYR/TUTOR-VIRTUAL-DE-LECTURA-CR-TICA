import User from "../../models/User.js";

describe("User model", () => {
  test("falla si faltan campos requeridos", () => {
    const u = new User({});
    const err = u.validateSync();

    expect(err).toBeTruthy();
    // según tu schema:
    expect(err.errors.nombre).toBeTruthy();
    expect(err.errors.email).toBeTruthy();
    expect(err.errors.passwordHash).toBeTruthy();
    // rol tiene default, no debería ser requerido
    expect(err.errors.rol).toBeUndefined();
  });

  test("acepta email válido, normaliza a lowercase y respeta enum de rol", () => {
    const u = new User({
      nombre: "Ana",
      email: "DemO@EXAMPLE.com",
      passwordHash: "x",
      rol: "docente",
    });

    const err = u.validateSync();
    expect(err).toBeUndefined();
    // tu schema tiene lowercase: true
    expect(u.email).toBe("demo@example.com");
    // enum real incluye admin
    expect(["docente", "estudiante", "admin"]).toContain(u.rol);
  });

  test("rechaza rol inválido", () => {
    const u = new User({
      nombre: "Ana",
      email: "a@x.com",
      passwordHash: "x",
      rol: "hacker",
    });

    const err = u.validateSync();
    expect(err).toBeTruthy();
    expect(err.errors.rol).toBeTruthy();
  });

  test("rechaza nombre con menos de 2 caracteres", () => {
    const u = new User({
      nombre: "A", // minlength: 2
      email: "a@x.com",
      passwordHash: "x",
      rol: "estudiante",
    });

    const err = u.validateSync();
    expect(err).toBeTruthy();
    expect(err.errors.nombre).toBeTruthy();
  });

  test("toJSON elimina passwordHash", () => {
    const u = new User({
      nombre: "Ana",
      email: "ana@example.com",
      passwordHash: "secreto",
      rol: "estudiante",
    });

    const plain = u.toJSON(); // tu método toJSON borra passwordHash
    expect(plain.passwordHash).toBeUndefined();
    // y debe conservar el resto
    expect(plain.email).toBe("ana@example.com");
  });
});
