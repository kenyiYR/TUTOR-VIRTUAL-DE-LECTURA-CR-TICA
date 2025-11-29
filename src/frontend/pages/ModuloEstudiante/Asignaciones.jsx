import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyAssignments } from '../../services/assignments.js';
import '../../styles/panel.css';

// ----- Helper IA: solo estado resumen -----

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

// ----- Componente principal -----

export default function AsignacionesAlumno() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

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


  function handleOpenDetail(assignment) {
    const id = assignment._id || assignment.id;
    if (!id) {
      setMsg('No se pudo identificar la asignación.');
      return;
    }

    navigate(`/estudiante/lecturas/${id}`, {
      state: { assignment }
    });
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
          Revisa tus lecturas, consulta su estado y entra al detalle de cada asignación.
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

              // NUEVO: resumen de progreso de IA
              let iaSummary = null;
              const questions = a.questions;
              if (questions && questions.status === 'ready') {
                const { literal = [], inferential = [], critical = [] } = questions;
                const totalQuestions =
                  (literal?.length || 0) +
                  (inferential?.length || 0) +
                  (critical?.length || 0);
                const answered = Array.isArray(a.answers) ? a.answers.length : 0;
                if (totalQuestions > 0) {
                  iaSummary = { totalQuestions, answered };
                }
              }

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
                    {/* Ir al flujo completo de la asignación */}
                    <button
                      className="btn student-detail-btn"
                      onClick={() => handleOpenDetail(a)}
                      style={{ marginBottom: '0.75rem' }}
                    >
                      Ver detalle de la asignación
                    </button>


                    {/* Estado de la IA */}
                    <IAStatus questions={a.questions} />

                    {/* NUEVO: línea de progreso IA */}
                    {iaSummary && (
                      <p className="ia-progress">
                        Progreso IA: {iaSummary.answered} / {iaSummary.totalQuestions}{' '}
                        respondidas
                      </p>
                    )}
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
