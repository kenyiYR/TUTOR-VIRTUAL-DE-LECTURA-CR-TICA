// src/frontend/pages/ModuloEstudiante/Estudiante.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../../../index.css";

const EMPTY_PROFILE = {
  carrera: "",
  ciclo: "",
  objetivos: "",
  intereses: "",
  horario: "",
  contacto: "",
  recordatorios: true,
};

export default function Estudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_PROFILE);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const storageKey = user?._id
  ? `tvlc_student_profile_${user._id}`
  : null;


  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!storageKey) return; // todavía no hay usuario cargado

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Siempre partimos de EMPTY_PROFILE para no arrastrar datos de otro
        setForm({ ...EMPTY_PROFILE, ...parsed });
      } else {
        // Perfil nuevo para este estudiante: vacío pero con su correo
        setForm({
          ...EMPTY_PROFILE,
          contacto: user?.email || "",
        });
      }
    } catch {
      // Si algo falla leyendo JSON, dejamos el perfil limpio
      setForm({
        ...EMPTY_PROFILE,
        contacto: user?.email || "",
      });
    }
  }, [storageKey, user?.email]);


  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(form));
      }
      setMsg("Cambios guardados en tu perfil ✅ Redirigiendo a tus lecturas…");

      setTimeout(() => {
        navigate("/estudiante/lecturas");
      }, 900);
    } catch {
      setMsg("No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="section-header">
        <h3>Módulo de estudiante</h3>
        <div className="actions">
          <Link className="link-btn" to="/estudiante/lecturas">
            Ver lecturas asignadas
          </Link>
        </div>
      </div>

      <div className="student-wrap">
        <div className="student-card">
          <header className="student-header">
            <h1>Perfil de estudiante</h1>
            <p>
              Estos datos ayudan a adaptar las actividades y el seguimiento de
              tu lectura crítica.
            </p>
            {user && (
              <p
                style={{
                  fontSize: ".82rem",
                  marginTop: "4px",
                  opacity: 0.9,
                }}
              >
                Sesión: <strong>{user.nombre}</strong> · {user.email}
              </p>
            )}
          </header>

          <form className="student-form" onSubmit={onSubmit}>
            <div className="student-two-columns">
              <div className="student-form-group">
                <label>Programa / carrera</label>
                <input
                  className="auth-input"
                  value={form.carrera}
                  onChange={(e) => setField("carrera", e.target.value)}
                  placeholder="Ej. Ingeniería de Sistemas"
                />
              </div>

              <div className="student-form-group">
                <label>Ciclo o semestre</label>
                <input
                  className="auth-input"
                  value={form.ciclo}
                  onChange={(e) => setField("ciclo", e.target.value)}
                  placeholder="Ej. 10.º ciclo"
                />
              </div>
            </div>

            <div className="student-form-group">
              <label>Objetivo principal con este curso</label>
              <textarea
                className="auth-input"
                rows={3}
                value={form.objetivos}
                onChange={(e) => setField("objetivos", e.target.value)}
                placeholder="Ej. mejorar mis argumentos escritos, prepararme para tesis, etc."
              />
            </div>

            <div className="student-form-group">
              <label>Temas o tipos de texto que te interesan</label>
              <textarea
                className="auth-input"
                rows={3}
                value={form.intereses}
                onChange={(e) => setField("intereses", e.target.value)}
                placeholder="Ensayos, tecnología, ética, derecho, actualidad..."
              />
            </div>

            <div className="student-two-columns">
              <div className="student-form-group">
                <label>Horario habitual de estudio</label>
                <input
                  className="auth-input"
                  value={form.horario}
                  onChange={(e) => setField("horario", e.target.value)}
                  placeholder="Ej. noches entre semana, sábados por la mañana"
                />
              </div>

              <div className="student-form-group">
                <label>Correo de contacto</label>
                <input
                  className="auth-input"
                  value={form.contacto}
                  onChange={(e) => setField("contacto", e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div className="student-form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.recordatorios}
                  onChange={(e) =>
                    setField("recordatorios", e.target.checked)
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
                Deseo recibir recordatorios sobre lecturas y entregas.
              </label>
            </div>

            <div className="student-footer">
              <div className="student-msg">
                {msg && (
                  <span
                    style={{
                      color: msg.includes("✅")
                        ? "var(--accent-strong)"
                        : "#fecaca",
                    }}
                  >
                    {msg}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
