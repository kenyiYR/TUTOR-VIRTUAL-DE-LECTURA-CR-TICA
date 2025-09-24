// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Login: busca en localStorage 'users' y setea user si coincide
  const login = (role, email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password && u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem("user", JSON.stringify(found));
      // redirigir según rol
      if (found.role === "estudiante") navigate("/estudiante");
      else if (found.role === "docente") navigate("/docente");
      else navigate("/");
      return { ok: true };
    }
    return { ok: false, message: "Credenciales incorrectas" };
  };

  // Register: guarda en 'users' y setea sesión
  const register = (name, role, email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) {
      return { ok: false, message: "Correo ya registrado" };
    }
    const newUser = { name, role, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    // inicializar history/progress keys
    localStorage.setItem(`progress_${email}`, JSON.stringify([]));
    localStorage.setItem(`history_${email}`, JSON.stringify([]));
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    if (role === "estudiante") navigate("/estudiante");
    else if (role === "docente") navigate("/docente");
    else navigate("/");
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // keep user state if localStorage changes externally
  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
