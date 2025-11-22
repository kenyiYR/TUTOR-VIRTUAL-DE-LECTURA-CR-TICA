import { useEffect, useState } from 'react';
import {
  listMyAssignments,
  toggleRead,
  submitWork,
  answerQuestion
} from '../../services/assignments.js';
import '../../styles/panel.css';

// ----- Helpers IA -----

function IAStatus({ questions }) {
  const status = questions?.status;

  if (!status) return null;

  if (status === 'pending') {
    return (
      <p className="ia-status ia-status-pending" style={{ marginTop: 8 }}>
        IA: generando preguntas...
      </p>
    );
  }

  if (status === 'failed') {
    return (
      <p className="ia-status ia-status-failed" style={{ marginTop: 8 }}>
        IA: no se pudieron generar las preguntas automáticamente.
      </p>
    );
  }

  if (status === 'ready') {
    return (
      <p className="ia-status ia-status-ready" style={{ marginTop: 8 }}>
        IA: preguntas listas.
      </p>
    );
  }

  return null;
}

function QuestionLevelBlock({
  title,
  level,
  questions,
  assignment,
  assignmentIndex,
  answerDrafts,
  onChangeDraft,
  onSendAnswer,
  answerLoadingKey
}) {
  if (!questions || questions.length === 0) return null;

  const answers = Array.isArray(assignment.answers) ? assignment.answers : [];

  return (
    <div className="ia-questions-level" style={{ marginTop: 8 }}>
      <h4 className="ia-questions-level-title" style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>
        {title}
      </h4>
      <ol className="ia-questions-list" style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {questions.map((q, idx) => {
          // Usamos id "propio" si existe; si no, el _id que viene de Mongo
const qId = q.id || q._id;

const key = `${assignment._id}::${qId || `${level}-${idx}`}`;

const existing = answers.find(
  (ans) => ans.questionId === (qId || `${level}-${idx}`)
);

const currentDraft =
  answerDrafts[key] ?? (existing?.answer ? existing.answer : '');


          const loading = answerLoadingKey === key;

          return (
            <li
              key={q.id || `${title}-${idx}`}
              className="ia-question-item"
              style={{ marginBottom: 10 }}
            >
              {/* Pregunta */}
              <p className="ia-question-prompt" style={{ margin: '0 0 4px' }}>
                {q.prompt}
              </p>

              {/* Respuesta anterior + feedback (si existe) */}
              {existing && (
                <div
                  className="ia-answer-feedback"
                  style={{
                    marginBottom: 6,
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)'
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>
                    <b>Tu respuesta:</b> {existing.answer}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>
                    <b>Retroalimentación IA:</b> {existing.feedbackText || '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                    Puntaje: {existing.score ?? '—'} · Veredicto:{' '}
                    {existing.verdict || '—'}
                  </p>
                </div>
              )}

              {/* Campo para nueva respuesta / actualización */}
              <div className="ia-answer-input" style={{ marginTop: 4 }}>
                <textarea
                  rows={3}
                  className="input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder={
                    existing
                      ? 'Puedes mejorar o actualizar tu respuesta...'
                      : 'Escribe aquí tu respuesta a esta pregunta...'
                  }
                  value={currentDraft}
                  onChange={(e) => onChangeDraft(key, e.target.value)}
                />
                <div style={{ marginTop: 4, textAlign: 'right' }}>
                  <button
                    className="btn"
                    disabled={loading}
                    onClick={() =>
                      onSendAnswer({
                        assignmentId: assignment._id,
                        assignmentIndex,
                        question: q,
                        storageKey: key
                      })
                    }
                  >
                    {loading
                      ? 'Enviando...'
                      : existing
                      ? 'Actualizar respuesta'
                      : 'Enviar respuesta'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function IAQuestionsBlock({
  assignment,
  assignmentIndex,
  answerDrafts,
  onChangeDraft,
  onSendAnswer,
  answerLoadingKey
}) {
  const questions = assignment.questions;
  if (!questions || questions.status !== 'ready') return null;

  const { literal = [], inferential = [], critical = [] } = questions;

  const totalLiteral = literal?.length || 0;
  const totalInferential = inferential?.length || 0;
  const totalCritical = critical?.length || 0;
  const total = totalLiteral + totalInferential + totalCritical;

  if (!total) return null;

  // cuántas ya tienen respuesta guardada
  const answeredCount = Array.isArray(assignment.answers)
    ? assignment.answers.length
    : 0;
  const pendingCount = Math.max(total - answeredCount, 0);

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`ia-questions-block ${expanded ? 'is-open' : 'is-collapsed'}`}
    >
      {/* Cabecera compacta */}
      <div className="ia-questions-header-row">
        <div className="ia-questions-header-text">
          <p className="ia-questions-title">Preguntas generadas por IA</p>
          <p className="ia-questions-summary">
            {total} pregunta{total !== 1 && 's'} en distintos niveles.{' '}
            {pendingCount > 0
              ? `${pendingCount} pendiente${
                  pendingCount !== 1 ? 's' : ''
                } por responder.`
              : 'Todo respondido por ahora.'}
          </p>
        </div>

        <div className="ia-questions-chips">
          {totalLiteral > 0 && (
            <span className="ia-chip">Literal · {totalLiteral}</span>
          )}
          {totalInferential > 0 && (
            <span className="ia-chip">Inferencial · {totalInferential}</span>
          )}
          {totalCritical > 0 && (
            <span className="ia-chip">Crítico · {totalCritical}</span>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost ia-questions-toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Ocultar' : 'Ver preguntas'}
        </button>
      </div>

      {/* Cuerpo con las preguntas: sólo si el usuario despliega */}
      {expanded && (
        <div className="ia-questions-body">
          <QuestionLevelBlock
            title="Nivel literal"
            level="literal"
            questions={literal}
            assignment={assignment}
            assignmentIndex={assignmentIndex}
            answerDrafts={answerDrafts}
            onChangeDraft={onChangeDraft}
            onSendAnswer={onSendAnswer}
            answerLoadingKey={answerLoadingKey}
          />

          <QuestionLevelBlock
            title="Nivel inferencial"
            level="inferential"
            questions={inferential}
            assignment={assignment}
            assignmentIndex={assignmentIndex}
            answerDrafts={answerDrafts}
            onChangeDraft={onChangeDraft}
            onSendAnswer={onSendAnswer}
            answerLoadingKey={answerLoadingKey}
          />

          <QuestionLevelBlock
            title="Nivel crítico (sesgos y falacias)"
            level="critical"
            questions={critical}
            assignment={assignment}
            assignmentIndex={assignmentIndex}
            answerDrafts={answerDrafts}
            onChangeDraft={onChangeDraft}
            onSendAnswer={onSendAnswer}
            answerLoadingKey={answerLoadingKey}
          />
        </div>
      )}
    </div>
  );
}


// ----- Componente principal -----

export default function AsignacionesAlumno() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerLoadingKey, setAnswerLoadingKey] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});


  async function load() {
    setLoading(true);
    try {
      const data = await listMyAssignments();
      setItems(data);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusOf = (a) => {
    if (a?.feedback?.at) return <span className="badge ok">revisado</span>;
    if (a?.submission?.at) return <span className="badge">entregado</span>;
    if (a?.readAt) return <span className="badge">leído</span>;
    return <span className="badge warn">pendiente</span>;
  };

  async function onToggle(id, idx) {
    try {
      const date = await toggleRead(id);
      const next = [...items];
      next[idx].readAt = date;
      setItems(next);
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function onSubmit(id, idx) {
    const input = document.getElementById(`file_${id}`);
    const note = document.getElementById(`note_${id}`)?.value || '';
    const file = input?.files?.[0];
    if (!file) return setMsg('Selecciona archivo');
    try {
      const res = await submitWork(id, { file, notes: note });
      const next = [...items];
      next[idx].submission = res;
      setItems(next);
      setMsg('Entrega enviada ✅');
      input.value = '';
    } catch (e) {
      setMsg(e.message);
    }
  }

  function handleDraftChange(key, value) {
    setAnswerDrafts((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  async function handleSendAnswer({ assignmentId, assignmentIndex, question, storageKey }) {
    const draft = (answerDrafts[storageKey] || '').trim();
    if (!draft) {
      setMsg('Escribe una respuesta antes de enviarla.');
      return;
    }

    try {
      setAnswerLoadingKey(storageKey);
      const qId = question.id || question._id;
if (!qId) {
  setMsg('No se pudo identificar la pregunta. Actualiza la página e inténtalo de nuevo.');
  return;
}

const saved = await answerQuestion(assignmentId, {
  questionId: qId,
  answer: draft
});


      setItems((prev) => {
        const next = [...prev];
        const a = { ...next[assignmentIndex] };
        const answers = Array.isArray(a.answers) ? [...a.answers] : [];
        const idx = answers.findIndex((ans) => ans.questionId === saved.questionId);
        if (idx >= 0) {
          answers[idx] = saved;
        } else {
          answers.push(saved);
        }
        a.answers = answers;
        next[assignmentIndex] = a;
        return next;
      });

      setAnswerDrafts((prev) => ({
        ...prev,
        [storageKey]: ''
      }));

      setMsg('Respuesta enviada y evaluada ✅');
    } catch (e) {
      setMsg(e.message || 'Error al enviar respuesta');
    } finally {
      setAnswerLoadingKey(null);
    }
  }

    return (
    <div className="page-wrap student-assignments-page">
      {/* mensaje global (errores / confirmaciones) */}
      {msg && (
        <div className="card student-message">
          {msg}
        </div>
      )}

      {/* encabezado de la vista */}
      <header className="student-assignments-header">
        <h2 className="student-assignments-title">Lecturas asignadas</h2>
        <p className="student-assignments-subtitle">
          Revisa tus lecturas, marca el progreso y envía tus respuestas al docente desde un solo lugar.
        </p>
      </header>

      <div className="panel-wrap student-assignments-wrap">
        {loading ? (
          <div className="card">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="card">No tienes asignaciones.</div>
        ) : (
          <div className="panel-grid student-assignments-grid">
            {items.map((a, i) => {
              const title = a.reading?.titulo || 'Lectura';
              const description = a.reading?.descripcion || '';
              const shortDesc =
                description.length > 160
                  ? description.slice(0, 160) + '…'
                  : description;

              return (
                <article key={a._id} className="card student-assignment-card">
                  <header className="student-assignment-header">
                    <div>
                      <h3 className="student-assignment-title">{title}</h3>
                      {description && (
                        <p className="student-assignment-desc">{shortDesc}</p>
                      )}
                    </div>
                    <div className="student-assignment-header-meta">
                      <span className="student-assignment-status">
                        {statusOf(a)}
                      </span>

                      {a.reading?.url && (
                        <a
                          className="link student-open-link"
                          href={a.reading.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir lectura
                        </a>
                      )}
                    </div>
                  </header>

                  <div className="student-assignment-body">
                    {/* estado de lectura */}
                    <button
                      className="btn gray student-read-toggle"
                      onClick={() => onToggle(a._id, i)}
                    >
                      {a.readAt ? 'Marcar como no leído' : 'Marcar como leído'}
                    </button>

                    {/* estado de la IA para esta lectura */}
                    <IAStatus questions={a.questions} />

                    {/* entrega de tarea */}
                    <div className="student-assignment-submit">
                      <div className="student-file-input">
                        <input
                          id={`file_${a._id}`}
                          type="file"
                          className="file-input-hidden"
                          onChange={(e) =>
                            setSelectedFiles((prev) => ({
                              ...prev,
                              [a._id]: e.target.files?.[0]?.name || ''
                            }))
                          }
                        />
                        <label
                          htmlFor={`file_${a._id}`}
                          className="file-label student-file-label"
                        >
                          <span className="file-label-main">
                            {selectedFiles[a._id]
                              ? 'Cambiar archivo'
                              : 'Subir archivo'}
                          </span>
                          <span className="file-label-name">
                            {selectedFiles[a._id] || 'PDF, DOCX o TXT'}
                          </span>
                        </label>
                      </div>

                      <input
                        id={`note_${a._id}`}
                        className="input student-note-input"
                        placeholder="Notas para el docente (opcional)"
                      />

                      <button
                        className="btn student-submit-btn"
                        onClick={() => onSubmit(a._id, i)}
                      >
                        {a.submission?.at ? 'Reenviar tarea' : 'Enviar tarea'}
                      </button>
                    </div>

                    {/* feedback del docente, si existe */}
                    {a.feedback?.at && (
                      <p className="student-feedback">
                        <b>Feedback:</b> {a.feedback.text || '—'} ·{' '}
                        <b>Puntaje:</b> {a.feedback.score ?? '—'}
                      </p>
                    )}

                    {/* bloque de preguntas IA + respuestas */}
                    <IAQuestionsBlock
                      assignment={a}
                      assignmentIndex={i}
                      answerDrafts={answerDrafts}
                      onChangeDraft={handleDraftChange}
                      onSendAnswer={handleSendAnswer}
                      answerLoadingKey={answerLoadingKey}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
