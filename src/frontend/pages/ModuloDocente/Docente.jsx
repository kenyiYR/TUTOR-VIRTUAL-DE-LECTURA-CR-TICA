import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyTeacherProfile,
  updateMyTeacherProfile,
} from "../../services/teacher.js";
import "../../../index.css";

const ALL_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export default function Docente() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    especialidad: "",
    bio: "",
    cursos: "",
    redes: { linkedin: "", github: "" },
    disponibilidad: { dias: [], horario: "" },
    avatarUrl: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyTeacherProfile();
        if (p) {
          setForm({
            especialidad: p.especialidad || "",
            bio: p.bio || "",
            cursos: Array.isArray(p.cursos)
              ? p.cursos.join(", ")
              : p.cursos || "",
            redes: {
              linkedin: p.redes?.linkedin || "",
              github: p.redes?.github || "",
            },
            disponibilidad: {
              dias: p.disponibilidad?.dias || [],
              horario: p.disponibilidad?.horario || "",
            },
            avatarUrl: p.avatarUrl || "",
          });
        }
      } catch (e) {
        setMsg(e.message || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setField(path, value) {
    setForm((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let ref = next;
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref[parts[i]];
      }
      ref[parts.at(-1)] = value;
      return next;
    });
  }

  function toggleDay(d) {
    setForm((prev) => {
      const current = prev.disponibilidad.dias || [];
      const exists = current.includes(d);
      const dias = exists
        ? current.filter((x) => x !== d)
        : [...current, d];
      return {
        ...prev,
        disponibilidad: { ...prev.disponibilidad, dias },
      };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        especialidad: form.especialidad.trim(),
        bio: form.bio.trim(),
        cursos: form.cursos
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        redes: {
          linkedin: form.redes.linkedin.trim(),
          github: form.redes.github.trim(),
        },
        disponibilidad: {
          dias: form.disponibilidad.dias,
          horario: form.disponibilidad.horario.trim(),
        },
        avatarUrl: form.avatarUrl.trim(),
      };

      const updated = await updateMyTeacherProfile(payload);

      setForm({
        especialidad: updated.especialidad || "",
        bio: updated.bio || "",
        cursos: Array.isArray(updated.cursos)
          ? updated.cursos.join(", ")
          : updated.cursos || "",
        redes: {
          linkedin: updated.redes?.linkedin || "",
          github: updated.redes?.github || "",
        },
        disponibilidad: {
          dias: updated.disponibilidad?.dias || [],
          horario: updated.disponibilidad?.horario || "",
        },
        avatarUrl: updated.avatarUrl || "",
      });

      setMsg("Cambios guardados ✅ Redirigiendo a tus lecturas…");

      // después de guardar, lo mandas al módulo real
      setTimeout(() => {
        navigate("/docente/lecturas");
      }, 900);
    } catch (e) {
      setMsg(e.message || "No se pudo guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-wrap">
        <div className="auth-card teacher-card">Cargando perfil…</div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card teacher-card">
        <header className="teacher-header">
          <h1 className="auth-title">Perfil Docente</h1>
          <p className="auth-sub">
            Completa tu información para los módulos de lectura crítica.
          </p>
        </header>

        <form className="auth-form teacher-form" onSubmit={onSubmit}>
          {/* Especialidad y bio */}
          <div className="teacher-form-group">
            <label>Especialidad</label>
            <input
              className="auth-input"
              value={form.especialidad}
              onChange={(e) => setField("especialidad", e.target.value)}
            />
          </div>

          <div className="teacher-form-group">
            <label>Biografía</label>
            <textarea
              className="auth-input"
              rows={4}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
            />
          </div>

          {/* Cursos y foto */}
          <div className="teacher-two-columns">
            <div className="teacher-form-group">
              <label>Cursos (separados por coma)</label>
              <input
                className="auth-input"
                value={form.cursos}
                onChange={(e) => setField("cursos", e.target.value)}
                placeholder="Lectura crítica I, Pensamiento crítico, ..."
              />
            </div>

            <div className="teacher-form-group">
              <label>Foto (URL)</label>
              <input
                className="auth-input"
                value={form.avatarUrl}
                onChange={(e) => setField("avatarUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Redes */}
          <div className="teacher-two-columns">
            <div className="teacher-form-group">
              <label>LinkedIn</label>
              <input
                className="auth-input"
                value={form.redes.linkedin}
                onChange={(e) =>
                  setField("redes.linkedin", e.target.value)
                }
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>

            <div className="teacher-form-group">
              <label>GitHub</label>
              <input
                className="auth-input"
                value={form.redes.github}
                onChange={(e) => setField("redes.github", e.target.value)}
                placeholder="https://github.com/usuario"
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="teacher-two-columns">
            <div className="teacher-form-group">
              <label>Días disponibles</label>
              <div className="teacher-days-row">
                {ALL_DAYS.map((d) => {
                  const active =
                    form.disponibilidad.dias?.includes(d);
                  return (
                    <label
                      key={d}
                      className={
                        "teacher-day-pill" +
                        (active ? " teacher-day-pill--active" : "")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleDay(d)}
                      />
                      {d}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="teacher-form-group">
              <label>Horario</label>
              <input
                className="auth-input"
                placeholder="09:00–13:00"
                value={form.disponibilidad.horario}
                onChange={(e) =>
                  setField("disponibilidad.horario", e.target.value)
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="teacher-footer">
            <div className="teacher-msg">
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
  );
}
