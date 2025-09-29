import React from "react";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../AuthContext";

// 📌 Importar helpers de Vitest
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

// 🛠️ Mock de localStorage para entorno Node/Vitest
beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
  });
});

// 🔧 Wrapper con router + AuthProvider
const wrapper = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("✅ debería registrar un usuario correctamente", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register(
        "Juan Pérez Gómez",
        "estudiante",
        "juan@example.com",
        "Password123!",
        "Password123!"
      );
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe("juan@example.com");
  });

  it("✅ debería rechazar registro con email repetido", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register(
        "Pedro Gómez Ramirez",
        "docente",
        "pedro@example.com",
        "Password123!",
        "Password123!"
      );
    });

    let response;
    act(() => {
      response = result.current.register(
        "Pedro Gómez Ramirez",
        "docente",
        "pedro@example.com",
        "Password123!",
        "Password123!"
      );
    });

    expect(response.ok).toBe(false);
    expect(response.message).toBe("Correo ya registrado");
  });

  it("✅ debería loguear un usuario existente", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register(
        "Ana López García",
        "docente",
        "ana@example.com",
        "StrongPass1!",
        "StrongPass1!"
      );
    });

    act(() => {
      result.current.logout();
    });

    let response;
    act(() => {
      response = result.current.login(
        "docente",
        "ana@example.com",
        "StrongPass1!"
      );
    });

    expect(response.ok).toBe(true);
    expect(result.current.user.email).toBe("ana@example.com");
  });

  it("❌ debería fallar con credenciales incorrectas", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    act(() => {
      response = result.current.login(
        "estudiante",
        "fake@example.com",
        "wrongpass"
      );
    });

    expect(response.ok).toBe(false);
    expect(response.message).toBe("Credenciales incorrectas");
  });

  it("✅ debería cerrar sesión correctamente", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register(
        "Luis Ramírez Soto",
        "estudiante",
        "luis@example.com",
        "Password123!",
        "Password123!"
      );
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
