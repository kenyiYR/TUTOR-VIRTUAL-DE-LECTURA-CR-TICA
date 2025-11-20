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

  if (
    (!literal || literal.length === 0) &&
    (!inferential || inferential.length === 0) &&
    (!critical || critical.length === 0)
  ) {
    return null;
  }

  return (
    <div
      className="ia-questions-block"
      style={{
        marginTop: 12,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)'
      }}
    >
      <h3
        className="ia-questions-title"
        style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600 }}
      >
        Preguntas generadas por IA
      </h3>

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
  );
}

// ----- Componente principal -----

export default function AsignacionesAlumno() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerLoadingKey, setAnswerLoadingKey] = useState(null);

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
    <div className="panel-wrap">
      {msg && (
        <div className="card" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}
      <div className="panel-grid">
        {loading ? (
          <div className="card">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="card">No tienes asignaciones.</div>
        ) : (
          items.map((a, i) => (
            <div key={a._id} className="card">
              <h3>{a.reading?.titulo || 'Lectura'}</h3>
              <p>{a.reading?.descripcion}</p>

              <div className="row">
                <a
                  className="link"
                  href={a.reading?.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir lectura
                </a>
                <span>{statusOf(a)}</span>
              </div>

              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn gray" onClick={() => onToggle(a._id, i)}>
                  {a.readAt ? 'Marcar como no leído' : 'Marcar como leído'}
                </button>
              </div>

              {/* Estado de la IA para esta asignación */}
              <IAStatus questions={a.questions} />

              <div className="hr" />
              <div className="row">
                <input id={`file_${a._id}`} className="file" type="file" />
                <input
                  id={`note_${a._id}`}
                  className="input"
                  placeholder="Notas (opcional)"
                  style={{ flex: 1 }}
                />
                <button className="btn" onClick={() => onSubmit(a._id, i)}>
                  {a.submission?.at ? 'Reenviar' : 'Enviar tarea'}
                </button>
              </div>

              {a.feedback?.at && (
                <p style={{ marginTop: 8 }}>
                  <b>Feedback:</b> {a.feedback.text || '—'} · <b>Puntaje:</b>{' '}
                  {a.feedback.score ?? '—'}
                </p>
              )}

              {/* Bloque de preguntas + respuestas + feedback IA */}
              <IAQuestionsBlock
                assignment={a}
                assignmentIndex={i}
                answerDrafts={answerDrafts}
                onChangeDraft={handleDraftChange}
                onSendAnswer={handleSendAnswer}
                answerLoadingKey={answerLoadingKey}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}