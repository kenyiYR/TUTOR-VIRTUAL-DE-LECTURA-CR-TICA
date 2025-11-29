import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  submitWork,
  answerQuestion,
  toggleRead
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

// ----- Detalle de la asignación -----

export default function AsignacionDetalleEstudiante() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const assignmentFromState = location.state?.assignment || null;

  const [assignment, setAssignment] = useState(assignmentFromState);
  const [msg, setMsg] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerLoadingKey, setAnswerLoadingKey] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // De momento dependemos del state que viene desde la lista.
    // Si recargas la página directamente, no tendremos datos.
    setAssignment(assignmentFromState);
  }, [assignmentFromState]);

  if (!assignment) {
    return (
      <div className="page-wrap">
        <div className="panel-wrap">
          <div className="card">
            <h2>Detalle de asignación</h2>
            <p>
              No se encontraron datos de la asignación.  
              Vuelve a esta pantalla entrando desde la lista de lecturas asignadas.
            </p>
            <button
              className="btn"
              onClick={() => navigate('/estudiante/lecturas')}
            >
              Volver a mis tareas
            </button>
          </div>
        </div>
      </div>
    );
  }

    const readingTitle =
    assignment.reading?.titulo || assignment.readingTitle || 'Lectura asignada';

  // MISMA lógica que el backend: feedback > entrega > leído > pendiente
  const status =
    assignment.feedback?.at
      ? 'revisado'
      : assignment.submission?.at
      ? 'entregado'
      : assignment.readAt
      ? 'leido'
      : 'pendiente';

  const statusLabelMap = {
    pendiente: 'pendiente',
    leido: 'leído',
    entregado: 'entregado',
    revisado: 'revisado'
  };

  const statusLabel = statusLabelMap[status] || status;

  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString()
    : null;


  async function handleToggleRead() {
    try {
      const date = await toggleRead(assignment._id);
      setAssignment((prev) =>
        prev ? { ...prev, readAt: date } : prev
      );
    } catch (e) {
      setMsg(e.message || 'Error al actualizar el estado de lectura.');
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileName(f ? f.name : '');
  }

  async function handleSubmitWork() {
    if (!file) {
      setMsg('Selecciona un archivo antes de enviar.');
      return;
    }
    try {
      const res = await submitWork(assignment._id, {
        file,
        notes
      });

      setAssignment((prev) =>
        prev ? { ...prev, submission: res } : prev
      );

      setMsg('Entrega enviada ✅');
      setFile(null);
      setFileName('');
      setNotes('');
    } catch (e) {
      setMsg(e.message || 'Error al enviar la entrega.');
    }
  }

  function handleDraftChange(key, value) {
    setAnswerDrafts((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  async function handleSendAnswer({ question, storageKey }) {
    const draft = (answerDrafts[storageKey] || '').trim();
    if (!draft) {
      setMsg('Escribe una respuesta antes de enviarla.');
      return;
    }

    try {
      setAnswerLoadingKey(storageKey);

      const qId = question.id || question._id;
      if (!qId) {
        setMsg(
          'No se pudo identificar la pregunta. Actualiza la página e inténtalo de nuevo.'
        );
        return;
      }

      const saved = await answerQuestion(assignment._id, {
        questionId: qId,
        answer: draft
      });

      setAssignment((prev) => {
        if (!prev) return prev;
        const a = { ...prev };
        const answers = Array.isArray(a.answers) ? [...a.answers] : [];
        const idx = answers.findIndex(
          (ans) => ans.questionId === saved.questionId
        );
        if (idx >= 0) {
          answers[idx] = saved;
        } else {
          answers.push(saved);
        }
        a.answers = answers;
        return a;
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

  const submissionAt = assignment.submission?.at
    ? new Date(assignment.submission.at).toLocaleString()
    : null;

  return (
    <div className="page-wrap student-assignments-page">
      {msg && (
        <div className="card student-message">
          {msg}
        </div>
      )}

      <div className="panel-wrap">
        <header className="panel-header" style={{ marginBottom: '1rem' }}>
          <button
            className="btn gray"
            onClick={() => navigate('/estudiante/lecturas')}
          >
            ← Volver a mis tareas
          </button>
        </header>

        <div className="panel-card">
          <div className="panel-card-header">
            <h2>{readingTitle}</h2>
            <span className={`status-badge status-${status}`}>
  Estado: {statusLabel}
</span>

          </div>
          {assignment.reading?.descripcion && (
            <p className="text-muted">
              {assignment.reading.descripcion}
            </p>
          )}
          {dueDate && (
            <p className="text-muted">
              Fecha límite: <strong>{dueDate}</strong>
            </p>
          )}

          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn gray"
              onClick={handleToggleRead}
            >
              {assignment.readAt ? 'Marcar como no leído' : 'Marcar como leído'}
            </button>

            {assignment.reading?.url && (
              <a
                className="btn"
                href={assignment.reading.url}
                target="_blank"
                rel="noreferrer"
              >
                Abrir lectura
              </a>
            )}

            <IAStatus questions={assignment.questions} />
          </div>
        </div>

        <div className="panel-grid" style={{ marginTop: '1rem' }}>
          {/* Paso 1: leer el texto */}
          <section className="panel-card">
            <h3 data-step="1">Paso 1: Leer el texto</h3>
            <p>
              Abre la lectura, léela con calma y marca la asignación como leída
              cuando hayas terminado este primer recorrido.
            </p>
            {!assignment.reading?.url && (
              <p className="text-muted">
                La URL del documento no está disponible en este momento.
              </p>
            )}
          </section>

          {/* Paso 2: preguntas IA */}
          <section className="panel-card">
            <h3 data-step="2">Paso 2: Responder las preguntas de la IA</h3>
            <p className="text-muted">
              Responde las preguntas generadas por la IA para entrenar tu lectura literal,
              inferencial y crítica.
            </p>

            <IAQuestionsBlock
              assignment={assignment}
              answerDrafts={answerDrafts}
              onChangeDraft={handleDraftChange}
              onSendAnswer={handleSendAnswer}
              answerLoadingKey={answerLoadingKey}
            />
          </section>

          {/* Paso 3: entrega del trabajo */}
          <section className="panel-card">
            <h3 data-step="3">Paso 3: Subir tu trabajo</h3>
            <p className="text-muted">
              Sube tu archivo final (ensayo, informe, análisis) y, si quieres, agrega un comentario
              para tu docente.
            </p>

            <div className="student-assignment-submit">
              <div className="student-file-input">
                <input
                  id={`file_${assignment._id}`}
                  type="file"
                  className="file-input-hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor={`file_${assignment._id}`}
                  className="file-label student-file-label"
                >
                  <span className="file-label-main">
                    {fileName ? 'Cambiar archivo' : 'Subir archivo'}
                  </span>
                  <span className="file-label-name">
                    {fileName || 'PDF, DOCX o TXT'}
                  </span>
                </label>
              </div>

              <input
                className="input student-note-input"
                placeholder="Notas para el docente (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button
                className="btn student-submit-btn"
                onClick={handleSubmitWork}
              >
                {assignment.submission?.at ? 'Reenviar tarea' : 'Enviar tarea'}
              </button>

              {submissionAt && (
                <p className="text-muted" style={{ marginTop: 6, fontSize: '0.85rem' }}>
                  Última entrega: {submissionAt}
                </p>
              )}
            </div>
          </section>

          {/* Paso 4: feedback */}
          <section className="panel-card">
  <h3 data-step="4">Paso 4: Ver retroalimentación</h3>
  {assignment.feedback?.at ? (
    <div className="teacher-feedback-box">
      <p className="teacher-feedback-title">
        ✅ Calificación registrada
      </p>
      <p>
        <b>Retroalimentación:</b> {assignment.feedback.text || '—'}
      </p>
      <p>
        <b>Puntaje:</b> {assignment.feedback.score ?? '—'}
      </p>
    </div>
  ) : (
    <p className="text-muted">
      Tu docente aún no ha registrado feedback en esta asignación.
      Cuando lo haga, aparecerá aquí.
    </p>
  )}
</section>

        </div>
      </div>
    </div>
  );
}
