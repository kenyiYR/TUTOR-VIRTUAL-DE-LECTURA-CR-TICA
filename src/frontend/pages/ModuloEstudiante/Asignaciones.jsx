import { useEffect, useState } from 'react';
import { listMyAssignments, toggleRead, submitWork } from '../../services/assignments.js';
import '../../styles/panel.css';

// ----- Componentes auxiliares IA -----

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

function QuestionLevelBlock({ title, questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="ia-questions-level" style={{ marginTop: 8 }}>
      <h4 className="ia-questions-level-title" style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>
        {title}
      </h4>
      <ol className="ia-questions-list" style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {questions.map((q, idx) => (
          <li
            key={q.id || `${title}-${idx}`}
            className="ia-question-item"
            style={{ marginBottom: 4 }}
          >
            <p className="ia-question-prompt" style={{ margin: 0 }}>
              {q.prompt}
            </p>
            {/* Si quisieras mostrar la respuesta esperada para el alumno, descomenta esto */}
            {/* {q.expectedAnswer && (
              <small className="ia-question-expected" style={{ display: 'block', opacity: 0.7 }}>
                Respuesta esperada (referencia): {q.expectedAnswer}
              </small>
            )} */}
          </li>
        ))}
      </ol>
    </div>
  );
}

function IAQuestionsBlock({ questions }) {
  if (!questions || questions.status !== 'ready') return null;

  const { literal = [], inferential = [], critical = [] } = questions;

  // Si por alguna razón no hay nada en ningún nivel, no mostramos el bloque
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
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <h3
        className="ia-questions-title"
        style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600 }}
      >
        Preguntas generadas por IA
      </h3>

      <QuestionLevelBlock title="Nivel literal" questions={literal} />
      <QuestionLevelBlock title="Nivel inferencial" questions={inferential} />
      <QuestionLevelBlock title="Nivel crítico" questions={critical} />
    </div>
  );
}

// ----- Componente principal -----

export default function AsignacionesAlumno() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

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

              {/* Bloque de preguntas por nivel (solo si status === "ready") */}
              <IAQuestionsBlock questions={a.questions} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
