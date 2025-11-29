// src/frontend/pages/ModuloDocente/TableroLecturas.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyReadings } from "../../services/readings.js";
import {
  listTeacherBoard,
  sendFeedback,
} from "../../services/assignments.js";
import "../../styles/panel.css";

function TeacherIAReview({ assignment }) {
  const questions = assignment.questions;
  const answers = Array.isArray(assignment.answers) ? assignment.answers : [];

  // Si no hay preguntas o la IA no terminó, no mostramos nada
  if (!questions || questions.status !== "ready") return null;

  const { literal = [], inferential = [], critical = [] } = questions;

  const totalQuestions =
    (literal?.length || 0) +
    (inferential?.length || 0) +
    (critical?.length || 0);

  if (!totalQuestions) return null;

  const answeredCount = answers.length;
  const [expanded, setExpanded] = useState(false);

  const groups = [
    { key: "literal", title: "Nivel literal", items: literal },
    { key: "inferential", title: "Nivel inferencial", items: inferential },
    {
      key: "critical",
      title: "Nivel crítico (sesgos y falacias)",
      items: critical,
    },
  ];

  return (
    <section className="board-section board-ia-section">
      <div className="board-ia-header">
        <h4>Respuestas y feedback de la IA</h4>
        <button
          type="button"
          className="btn-ghost board-ia-toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Ocultar" : "Ver detalle"}
        </button>
      </div>

      <p className="board-meta">
        {totalQuestions} pregunta{totalQuestions !== 1 ? "s" : ""} generada
        {totalQuestions !== 1 ? "s" : ""} · {answeredCount} respondida
        {answeredCount !== 1 ? "s" : ""}.
      </p>

      {expanded && (
        <div className="board-ia-body">
          {groups.map((group) => {
            if (!group.items || group.items.length === 0) return null;

            return (
              <div key={group.key} className="board-ia-level">
                <p className="board-ia-level-title">{group.title}</p>
                <ol className="board-ia-questions-list">
                  {group.items.map((q, idx) => {
                    const qId = q.id || q._id;
                    const ans = answers.find(
                      (a) => a.questionId === qId
                    );

                    return (
                      <li
                        key={qId || `${group.key}-${idx}`}
                        className="board-ia-question"
                      >
                        <p className="board-ia-question-prompt">
                          {q.prompt}
                        </p>

                        {ans ? (
                          <div className="board-ia-answer-box">
                            <p>
                              <b>Respuesta del estudiante:</b>{" "}
                              {ans.answer}
                            </p>
                            <p>
                              <b>Feedback de la IA:</b>{" "}
                              {ans.feedbackText || "—"}
                            </p>
                            <p className="board-ia-meta">
                              Puntaje: {ans.score ?? "—"} · Veredicto:{" "}
                              {ans.verdict || "—"}
                            </p>
                          </div>
                        ) : (
                          <p className="board-meta muted">
                            Sin respuesta registrada para esta pregunta.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function TableroLecturas() {
  const [readings, setReadings] = useState([]);
  const [readingId, setReadingId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Cargar lecturas del docente (para el filtro)
  async function loadReadings() {
    try {
      const data = await listMyReadings();
      setReadings(data || []);
    } catch (e) {
      console.error(e);
      setMsg(e.message || "No se pudieron cargar las lecturas.");
    }
  }

  // Cargar tablero (asignaciones) según filtro
  async function loadBoard() {
    setLoading(true);
    try {
      const data = await listTeacherBoard(readingId || undefined);
      setItems(data || []);
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg(e.message || "No se pudo cargar el tablero.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingId]);

  async function onFeedback(id, idx) {
    const scoreEl = document.getElementById(`fb_score_${id}`);
    const textEl = document.getElementById(`fb_txt_${id}`);

    const scoreRaw = scoreEl?.value?.trim() || "";
    const text = textEl?.value?.trim() || "";

    if (!text && !scoreRaw) {
      setMsg("Escribe un comentario o un puntaje antes de enviar.");
      return;
    }

    try {
      const saved = await sendFeedback(id, {
        text,
        score: scoreRaw,
      });

      setItems((prev) => {
        const next = [...prev];
        const a = { ...next[idx], feedback: saved };
        next[idx] = a;
        return next;
      });

      setMsg("Feedback enviado ✅");
    } catch (e) {
      console.error(e);
      setMsg(e.message || "No se pudo enviar el feedback.");
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
            Revisa qué han leído tus estudiantes, su estado de entrega,
            las respuestas que han enviado a la IA y envía feedback desde un solo lugar.
          </p>
        </div>

        <div className="board-header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={loadBoard}
          >
            Recargar
          </button>

          <Link
            to="/docente/lecturas"
            className="btn-secondary"
          >
            Asignar nuevas lecturas
          </Link>
        </div>
      </div>

      <div className="panel-wrap">
        {/* Filtros superiores */}
        <section className="board-filters">
          <div className="board-filter-col">
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

            {msg && <span className="board-message">{msg}</span>}
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
                  <article key={a._id} className="card board-card">
                    <header className="board-card-header">
                      <div>
                        <h3>{a.reading?.titulo || "Lectura"}</h3>
                        <p className="board-card-student">
                          <span className="label">Estudiante:</span>{" "}
                          {a.student?.nombre || "—"}{" "}
                          <span className="board-card-email">
                            ({a.student?.email || "sin correo"})
                          </span>
                        </p>
                      </div>

                      <span className={statusClass}>{st.label}</span>
                    </header>

                    <div className="board-card-body">
                      {/* Bloque: Entrega del estudiante */}
                      <section className="board-section">
                        <h4>Entrega del estudiante</h4>

                        {a.submission?.at ? (
                          <>
                            <p className="board-meta">
                              Entregado el{" "}
                              {new Date(
                                a.submission.at
                              ).toLocaleString()}
                            </p>

                            {a.submissionUrl && (
                              <a
                                href={a.submissionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="board-file-link"
                              >
                                Ver archivo enviado
                              </a>
                            )}

                            {a.submission?.notes && (
                              <p className="board-meta">
                                <b>Notas del estudiante:</b>{" "}
                                {a.submission.notes}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="board-meta muted">
                            Aún no hay entrega registrada para esta asignación.
                          </p>
                        )}
                      </section>

                      {/* Bloque: Respuestas IA + feedback */}
                      <TeacherIAReview assignment={a} />

                      {/* Bloque: Feedback del docente */}
                      <section className="board-section">
                        <h4>Feedback del docente</h4>

                        <div className="board-field-row">
                          <label htmlFor={`fb_score_${a._id}`}>
                            Puntaje
                          </label>
                          <input
                            id={`fb_score_${a._id}`}
                            className="input board-score-input"
                            placeholder="Ej. 18"
                            defaultValue={a.feedback?.score ?? ""}
                          />
                        </div>

                        <div className="board-field-row">
                          <label htmlFor={`fb_txt_${a._id}`}>
                            Comentario
                          </label>
                          <input
                            id={`fb_txt_${a._id}`}
                            className="input board-comment-input"
                            placeholder="Comentario para el estudiante"
                            defaultValue={a.feedback?.text ?? ""}
                          />
                        </div>

                        {a.feedback?.at && (
                          <p className="board-card-meta">
                            Última actualización:{" "}
                            {new Date(
                              a.feedback.at
                            ).toLocaleString()}
                          </p>
                        )}
                      </section>
                    </div>

                    <footer className="board-card-footer">
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => onFeedback(a._id, idx)}
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
