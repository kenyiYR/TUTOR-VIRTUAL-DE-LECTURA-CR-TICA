// src/frontend/pages/ModuloDocente/TableroLecturas.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyReadings } from "../../services/readings.js";
import {
  listTeacherBoard,
  sendFeedback,
} from "../../services/assignments.js";
import "../../styles/panel.css";

export default function TableroLecturas() {
  const [readings, setReadings] = useState([]);
  const [readingId, setReadingId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setReadings(await listMyReadings());
      } catch (e) {
        console.error(e);
        setMsg(e.message);
      }
    })();
  }, []);

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const data = await listTeacherBoard(readingId || undefined);
      setItems(data);
    } catch (e) {
      console.error(e);
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingId]);

  async function onFeedback(id, idx) {
    const text =
      document.getElementById(`fb_txt_${id}`)?.value?.trim() || "";
    const score =
      document.getElementById(`fb_score_${id}`)?.value?.trim() || "";

    try {
      const fb = await sendFeedback(id, { text, score });
      const next = [...items];
      next[idx].feedback = fb;
      setItems(next);
      setMsg("Feedback enviado ✅");
    } catch (e) {
      console.error(e);
      setMsg(e.message);
    }
  }

  const statusInfo = (a) => {
    if (a?.feedback?.at)
      return { label: "revisado", tone: "ok" };
    if (a?.submission?.at)
      return { label: "entregado", tone: "entregado" };
    if (a?.readAt) return { label: "leído", tone: "leido" };
    return { label: "pendiente", tone: "warn" };
  };

  return (
    <main className="page-wrap board-page">
      {/* Header superior */}
      <div className="section-header board-header">
        <div>
          <h3>Tablero de lecturas</h3>
          <p className="section-subtitle">
            Revisa lo que han leído tus estudiantes, su estado de entrega
            y envía feedback sin salir de esta vista.
          </p>
        </div>

        <div className="board-header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={load}
          >
            Actualizar
          </button>
          <Link to="/docente/lecturas" className="link-btn">
            ← Volver a lecturas
          </Link>
        </div>
      </div>

      <div className="panel-wrap board-panel">
        {/* Filtro de lecturas */}
        <section className="card board-filter-card">
          <div className="board-filter-top">
            <div>
              <label
                htmlFor="readingFilter"
                className="board-filter-label"
              >
                Filtro de lecturas
              </label>
              <p className="help-text">
                Elige una lectura específica o revisa todas tus
                asignaciones.
              </p>
            </div>
          </div>

          <div className="board-filter-row">
            <select
              id="readingFilter"
              className="select board-filter-select"
              value={readingId}
              onChange={(e) => setReadingId(e.target.value)}
            >
              <option value="">Todas mis lecturas</option>
              {readings.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.titulo}
                </option>
              ))}
            </select>

            {msg && (
              <span className="board-message">
                {msg}
              </span>
            )}
          </div>
        </section>

        {/* Grid de asignaciones */}
        <section className="board-grid-section">
          {loading ? (
            <div className="card board-empty">
              Cargando asignaciones…
            </div>
          ) : items.length === 0 ? (
            <div className="card board-empty">
              <p>No hay asignaciones para este filtro.</p>
              <p className="muted">
                Asigna lecturas desde la vista{" "}
                <b>“Asignación de lecturas”</b> para verlas aquí.
              </p>
            </div>
          ) : (
            <div className="panel-grid board-grid">
              {items.map((a, idx) => {
                const st = statusInfo(a);
                const statusClass = `board-status board-status-${st.tone}`;

                return (
                  <article
                    key={a._id}
                    className="card board-card"
                  >
                    <header className="board-card-header">
                      <div>
                        <h3>
                          {a.reading?.titulo || "Lectura"}
                        </h3>
                        <p className="board-card-student">
                          <span className="label">
                            Estudiante:
                          </span>{" "}
                          {a.student?.nombre || "Sin nombre"}
                          {a.student?.email && (
                            <span className="board-card-email">
                              {" "}
                              · {a.student.email}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className={statusClass}>
                        {st.label}
                      </span>
                    </header>

                    <div className="board-card-body">
                      <div className="board-field-row">
                        <label
                          htmlFor={`fb_score_${a._id}`}
                        >
                          Puntaje
                        </label>
                        <input
                          id={`fb_score_${a._id}`}
                          className="input board-score-input"
                          placeholder="Ej. 18"
                          defaultValue={
                            a.feedback?.score ?? ""
                          }
                        />
                      </div>

                      <div className="board-field-row">
                        <label
                          htmlFor={`fb_txt_${a._id}`}
                        >
                          Comentario
                        </label>
                        <input
                          id={`fb_txt_${a._id}`}
                          className="input"
                          placeholder="Comentario para el estudiante"
                          defaultValue={
                            a.feedback?.text ?? ""
                          }
                        />
                      </div>
                    </div>

                    <footer className="board-card-footer">
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() =>
                          onFeedback(a._id, idx)
                        }
                      >
                        Enviar feedback
                      </button>

                      {a.feedback?.at && (
                        <span className="board-card-meta">
                          Feedback registrado.
                        </span>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
