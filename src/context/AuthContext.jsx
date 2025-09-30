import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  validateEmail,
  validatePassword,
  validateFullName,
} from "../frontend/utils/authValidators";
import CryptoJS from "crypto-js";

const AuthContext = createContext();

// 🔧 Helper para usar localStorage seguro (soporta entorno Node/Jest)
const safeLocalStorage =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const raw = safeLocalStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // 🔑 LOGIN
  const login = (role, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = JSON.parse(safeLocalStorage.getItem("users") || "[]");

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const found = users.find(
      (u) =>
        u.email === normalizedEmail &&
        u.password === hashedPassword &&
        u.role === role
    );

    if (found) {
      setUser(found);
      safeLocalStorage.setItem("user", JSON.stringify(found));

      if (found.role === "estudiante") navigate("/estudiante");
      else if (found.role === "docente") navigate("/docente");
      else navigate("/");

      return { ok: true };
    }

    return { ok: false, message: "Credenciales incorrectas" };
  };

  // 📝 REGISTER
  const register = (name, role, email, password, repeatPassword) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateFullName(name)) {
      return {
        ok: false,
        message:
          "Debes ingresar tu nombre completo con ambos apellidos, solo letras.",
      };
    }

    if (!validateEmail(normalizedEmail)) {
      return { ok: false, message: "Correo inválido" };
    }

    if (password !== repeatPassword) {
      return { ok: false, message: "Las contraseñas no coinciden" };
    }

    if (!validatePassword(password)) {
      return {
        ok: false,
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
      };
    }

    const users = JSON.parse(safeLocalStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === normalizedEmail)) {
      return { ok: false, message: "Correo ya registrado" };
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();
    const newUser = {
      name,
      role,
      email: normalizedEmail,
      password: hashedPassword,
    };

    users.push(newUser);
    safeLocalStorage.setItem("users", JSON.stringify(users));
    safeLocalStorage.setItem(`progress_${normalizedEmail}`, JSON.stringify([]));
    safeLocalStorage.setItem(`history_${normalizedEmail}`, JSON.stringify([]));

    setUser(newUser);
    safeLocalStorage.setItem("user", JSON.stringify(newUser));

    if (role === "estudiante") navigate("/estudiante");
    else if (role === "docente") navigate("/docente");
    else navigate("/");

    return { ok: true };
  };

  // 🚪 LOGOUT
  const logout = () => {
    setUser(null);
    safeLocalStorage.removeItem("user");
    navigate("/login");
  };

  // 🔄 Mantener sesión si cambia en otra pestaña
  useEffect(() => {
    const onStorage = () => {
      const raw = safeLocalStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
