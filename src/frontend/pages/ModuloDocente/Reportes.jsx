// src/frontend/pages/ModuloDocente/Reportes.jsx
import { useEffect, useState } from "react";
import { getTeacherRemindersReport } from "../../services/reports.js";
import "../../styles/panel.css";

export default function ReportesDocente() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    reminders: 0,
    students: 0,
    readings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      setError("");
      const { items, totals } = await getTeacherRemindersReport();
      setItems(items);
      setTotals(totals);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar el reporte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-wrap">
      <header className="panel-header">
  <div>
    <h1>Reportes de recordatorios</h1>
    <p className="panel-subtitle">
      Resumen de los recordatorios automáticos enviados a tus estudiantes por
      n8n.
    </p>
  </div>
  <button
    type="button"
    className="btn gray"
    disabled={loading}
    onClick={loadReport}
  >
    {loading ? "Actualizando..." : "Actualizar"}
  </button>
</header>



      {/* Resumen */}
<section className="panel-grid panel-metrics">
  <div className="panel-card metric-card">
    <span className="metric-label">Total de recordatorios enviados</span>
    <span className="metric-value">{totals.reminders}</span>
  </div>

  <div className="panel-card metric-card">
    <span className="metric-label">Estudiantes alcanzados</span>
    <span className="metric-value">{totals.students}</span>
  </div>

  <div className="panel-card metric-card">
    <span className="metric-label">Lecturas con recordatorios</span>
    <span className="metric-value">{totals.readings}</span>
  </div>
</section>


      {/* Tabla detalle */}
      <section className="panel-card">
        <h3 style={{ marginBottom: "8px" }}>Detalle por estudiante y lectura</h3>
        <p className="panel-hint">
  Cada fila representa una combinación lectura–estudiante donde n8n ha
  enviado recordatorios.
</p>


        {loading && <p>Cargando datos...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-muted">
            Aún no hay recordatorios registrados. Asigna lecturas con fecha
            límite y deja que n8n haga su trabajo.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Correo</th>
                  <th>Lectura</th>
                  <th>Recordatorios enviados</th>
                  <th>Primer recordatorio</th>
                  <th>Último recordatorio</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={`${it.readingId}-${it.studentId}`}>
                    <td>{it.studentName}</td>
                    <td>{it.studentEmail}</td>
                    <td>{it.readingTitle}</td>
                    <td>{it.remindersCount}</td>
                    <td>
                      {it.firstReminderAt
                        ? new Date(it.firstReminderAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {it.lastReminderAt
                        ? new Date(it.lastReminderAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
