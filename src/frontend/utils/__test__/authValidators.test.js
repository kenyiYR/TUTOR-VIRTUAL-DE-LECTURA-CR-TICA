import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateFullName } from "../authValidators";

describe("authValidators", () => {
  it("valida emails correctamente", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("mal.correo")).toBe(false);
  });

  it("valida contraseñas fuertes", () => {
    expect(validatePassword("StrongP@ssw0rd")).toBe(true);   // válida
    expect(validatePassword("weakpass")).toBe(false);        // muy débil
    expect(validatePassword("NoNumber!")).toBe(false);       // falta número
    expect(validatePassword("nouppercase1!")).toBe(false);   // falta mayúscula
  });

  it("valida nombres completos", () => {
    expect(validateFullName("Juan Pérez Gómez")).toBe(true); // válido
    expect(validateFullName("Juan")).toBe(false);            // muy corto
    expect(validateFullName("Juan Perez")).toBe(false);      // falta segundo apellido
    expect(validateFullName("123 Juan Perez")).toBe(false);  // caracteres inválidos
  });
});
