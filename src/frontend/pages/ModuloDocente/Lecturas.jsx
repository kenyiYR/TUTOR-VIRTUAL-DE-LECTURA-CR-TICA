import { useEffect, useState } from "react";
import { listMyReadings, uploadReading } from "../../services/readings.js";
import { assignReading } from "../../services/assignments.js";
import { listAssignableStudents } from "../../services/teacher.js";
import { Link } from "react-router-dom";
import "../../styles/panel.css";

export default function LecturasDocente() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // form upload
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState(null);

  // asignar
  const [assignOpen, setAssignOpen] = useState(null); // readingId abierto
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);; // IDs separados por coma
  const [due, setDue] = useState("");
  const [expanded, setExpanded] = useState({});


  async function load() {
    setLoading(true);
    try {
      setItems(await listMyReadings());
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

    async function loadStudents() {
    try {
      const data = await listAssignableStudents();
      setStudents(data || []);
    } catch (e) {
      setMsg(e.message || "No se pudieron cargar los estudiantes");
    }
  }


   useEffect(() => {
    load();
    loadStudents();
  }, []);

  async function onUpload(e) {
    e.preventDefault();
    setMsg("");
    if (!file) return setMsg("Selecciona un archivo");

    try {
      await uploadReading({ titulo, descripcion, file });
      setTitulo("");
      setDescripcion("");
      setFile(null);
      await load();
      setMsg("Lectura subida ✅");
    } catch (e) {
      setMsg(e.message);
    }
  }

    async function onAssign(readingId) {
    if (!selectedStudents.length) {
      setMsg("Selecciona al menos un estudiante.");
      return;
    }

    try {
      await assignReading({
        readingId,
        studentIds: selectedStudents,
        dueDate: due || undefined
      });

      setMsg("Asignación creada ✅");
      setAssignOpen(null);
      setSelectedStudents([]);
      setDue("");
    } catch (e) {
      setMsg(e.message || "No se pudo crear la asignación.");
    }
  }


  return (
    <div className="page-wrap readings-page">
      {/* Header superior */}
      <div className="section-header readings-header">
        <div>
          <h3>Asignación de lecturas</h3>
          <p className="section-subtitle">
            Sube textos y asígnalos a tus estudiantes con fechas claras y en un solo lugar.
          </p>
        </div>
        <Link className="link-btn" to="/docente/tablero">
          Ver tablero
        </Link>
      </div>

      <div className="panel-wrap readings-layout">
        {/* Card de subida */}
        <section className="card readings-upload-card">
          <header className="readings-upload-header">
            <div>
              <h4>Subir nueva lectura</h4>
              <p className="help-text">
                Elige un archivo, ponle un título y una breve descripción de qué quieres
                que trabajen.
              </p>
            </div>
            <span className="badge-soft">PDF · DOCX · TXT</span>
          </header>

          <form onSubmit={onUpload} className="readings-upload-form">
            <div className="readings-upload-row">
              <input
                className="input"
                placeholder="Título de la lectura"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
              <div className="readings-upload-file">
  <label className="file-label">
    <span className="file-label-main">
      {file ? "Cambiar archivo" : "Seleccionar archivo"}
    </span>
    <span className="file-label-name">
      {file ? file.name : "PDF, DOCX o TXT"}
    </span>
    <input
      type="file"
      accept=".pdf,.doc,.docx,.txt"
      onChange={(e) => setFile(e.target.files[0] || null)}
      required
    />
  </label>
</div>

            </div>

            <textarea
              className="input readings-upload-description"
              placeholder="Descripción (opcional): curso, tema, tipo de análisis, etc."
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <div className="readings-upload-footer">
              <button className="btn-primary" type="submit">
                Subir lectura
              </button>
              {msg && <span className="readings-message">{msg}</span>}
            </div>
          </form>
        </section>

        {/* Listado de lecturas */}
        <section className="readings-list-section">
          <header className="readings-list-header">
            <h4>Lecturas creadas</h4>
            <p className="help-text">
              Usa el botón <b>Asignar</b> para enviarlas a un grupo de estudiantes.
            </p>
          </header>

          {loading ? (
            <p className="muted">Cargando lecturas…</p>
          ) : items.length === 0 ? (
            <div className="readings-empty">
              <p>No tienes lecturas registradas todavía.</p>
              <p className="muted">
                Sube tu primer texto arriba para empezar a trabajar con el tutor.
              </p>
            </div>
          ) : (
            <div className="panel-grid readings-grid">
              {items.map((r) => {
  const fullDesc = r.descripcion || "Sin descripción registrada.";
  const isLong = fullDesc.length > 220;
  const isExpanded = expanded[r._id] === true;
  const displayDesc =
    !isLong || isExpanded ? fullDesc : fullDesc.slice(0, 220) + "…";

  const isAssign = assignOpen === r._id;

  return (
    <article
      key={r._id}
      className={
        "card reading-card" +
        (isAssign ? " reading-card--active" : "") +
        (isExpanded ? " reading-card--expanded" : "")
      }
    >
      <header className="reading-card-header">
        <h3>{r.titulo}</h3>
        <small className="reading-id">ID · {r._id.slice(-8)}</small>
      </header>

      <p className="reading-desc">{displayDesc}</p>

      {isLong && (
        <button
          type="button"
          className="reading-more"
          onClick={() =>
            setExpanded((prev) => ({
              ...prev,
              [r._id]: !prev[r._id],
            }))
          }
        >
          {isExpanded ? "Ver menos" : "Ver más"}
        </button>
      )}

      <div className="reading-meta-row">
        <a
          className="link"
          href={r.url}
          target="_blank"
          rel="noreferrer"
        >
          Ver archivo
        </a>
        <button
          type="button"
          className="btn-outline reading-assign-toggle"
          onClick={() => setAssignOpen(isAssign ? null : r._id)}
        >
          {isAssign ? "Cerrar asignación" : "Asignar"}
        </button>
      </div>

      {isAssign && (
        <div className="reading-assign">
          <p className="help-text">
            Selecciona los estudiantes a los que quieres asignar esta lectura.
          </p>

          {students.length === 0 ? (
            <p className="help-text">
              No hay estudiantes registrados todavía.
            </p>
          ) : (
            <div className="reading-assign-students">
              {students.map((s) => {
                const checked = selectedStudents.includes(s._id);
                return (
                  <label
                    key={s._id}
                    className={
                      "student-chip" + (checked ? " is-selected" : "")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedStudents((prev) =>
                          e.target.checked
                            ? [...prev, s._id]
                            : prev.filter((id) => id !== s._id)
                        );
                      }}
                    />
                    <span className="student-chip-name">{s.nombre}</span>
                    <span className="student-chip-email">
                      ({s.email})
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="reading-assign-row" style={{ marginTop: "0.75rem" }}>
            <input
              className="input date"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>

          <div className="reading-assign-footer">
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onAssign(r._id)}
            >
              Confirmar asignación
            </button>
          </div>
        </div>
      )}

    </article>
  );
})}

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
