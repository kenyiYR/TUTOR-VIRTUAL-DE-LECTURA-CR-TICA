// src/frontend/pages/PerfilUsuario/Perfil.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getUser, getUserRole } from "../../services/auth.js";
import { getMyTeacherProfile } from "../../services/teacher.js";
import "../../../index.css";

// Helper seguro para localStorage
const safeLocalStorage =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
      };

// Clave de perfil estudiante (coincide con el módulo Estudiante)
function getStudentProfileKey(user) {
  if (!user) return "tvlc_student_profile";
  const id = user._id || user.id || user.email || "anon";
  return `tvlc_student_profile_${id}`;
}

export default function Perfil() {
  const user = getUser();
  const roleFromSvc = getUserRole();
  const role = roleFromSvc || user?.rol || user?.role || null;

  const [teacherProfile, setTeacherProfile] = React.useState(null);
  const [studentProfile, setStudentProfile] = React.useState(null);
  const [loadingTeacher, setLoadingTeacher] = React.useState(role === "docente");
  const [loadingStudent, setLoadingStudent] = React.useState(role === "estudiante");
  const [error, setError] = React.useState("");

  const email = user?.email || "";
  const displayName = user?.nombre || user?.name || "";

  const history = useMemo(() => {
    try {
      const raw = safeLocalStorage.getItem(`history_${email}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [email]);

  // Cargar perfil docente desde la API
  React.useEffect(() => {
    let alive = true;
    if (role !== "docente") return;

    (async () => {
      setLoadingTeacher(true);
      try {
        const profile = await getMyTeacherProfile();
        if (!alive) return;
        setTeacherProfile(profile);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError("No se pudo cargar el perfil docente.");
      } finally {
        if (alive) setLoadingTeacher(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role]);

  // Cargar perfil estudiante desde localStorage
  React.useEffect(() => {
    if (role !== "estudiante") return;
    try {
      const key = getStudentProfileKey(user);
      const raw = safeLocalStorage.getItem(key);
      if (raw) {
        setStudentProfile(JSON.parse(raw));
      } else {
        setStudentProfile(null);
      }
    } catch (e) {
      console.error(e);
      setStudentProfile(null);
    } finally {
      setLoadingStudent(false);
    }
  }, [role, user]);

  const initials = useMemo(() => {
    if (!displayName) return "TU";
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const avatarUrl =
    (role === "docente" && teacherProfile?.avatarUrl) ||
    (role === "estudiante" && studentProfile?.avatarUrl) ||
    "";

  const roleLabel =
    role === "docente"
      ? "Docente"
      : role === "estudiante"
      ? "Estudiante"
      : role || "Usuario";

  return (
    <main className="page-wrap profile-page">
      <header className="profile-header">
        <div>
          <h1>Perfil de usuario</h1>
          <p>
            Revisa tu información básica y cómo se muestra en los módulos del tutor
            virtual.
          </p>
        </div>
      </header>

      {error && <div className="profile-error">{error}</div>}

      <section className="profile-layout">
        {/* Columna izquierda: resumen */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName || "Avatar"} />
            ) : (
              <span className="profile-avatar-initials">{initials}</span>
            )}
          </div>

          <h2 className="profile-name">
            {displayName || "Usuario sin nombre"}
          </h2>
          <p className="profile-role-badge">{roleLabel}</p>
          {email && <p className="profile-email">{email}</p>}

          {!role && (
            <p className="help-text" style={{ marginTop: 6 }}>
              No se ha detectado un rol. Vuelve a iniciar sesión si algo no coincide.
            </p>
          )}
        </aside>

        {/* Columna derecha: tarjetas */}
        <div className="profile-main">
          {/* Datos de cuenta */}
          <section className="profile-card">
            <header>
              <h2>Datos de cuenta</h2>
              <p className="profile-help">
                Estos datos vienen de tu registro en la plataforma.
              </p>
            </header>

            <div className="profile-grid-two">
              <div>
                <label>Nombre completo</label>
                <div className="profile-readonly-field">
                  {displayName || <span className="muted">Sin registrar</span>}
                </div>
              </div>
              <div>
                <label>Correo</label>
                <div className="profile-readonly-field">
                  {email || <span className="muted">Sin correo</span>}
                </div>
              </div>
            </div>

            <div className="profile-note">
              De momento estos datos solo se muestran aquí. Si en tu versión final
              implementas edición de usuario, este es el lugar lógico para engancharla.
            </div>
          </section>

          {/* Información según rol */}
          {role === "docente" && (
            <section className="profile-card">
              <header>
                <h2>Resumen de perfil docente</h2>
                <p className="profile-help">
                  Esta información se usa en el módulo Docente para organizar lecturas y
                  horarios.
                </p>
              </header>

              {loadingTeacher ? (
                <p className="muted">Cargando perfil docente…</p>
              ) : teacherProfile ? (
                <>
                  <div className="profile-grid-two">
                    <div>
                      <label>Especialidad</label>
                      <div className="profile-readonly-field">
                        {teacherProfile.especialidad || (
                          <span className="muted">Sin especificar</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Horario de trabajo</label>
                      <div className="profile-readonly-field">
                        {teacherProfile.disponibilidad?.horario || (
                          <span className="muted">No definido</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Cursos o líneas que dicta</label>
                      <div className="profile-readonly-field">
                        {Array.isArray(teacherProfile.cursos) &&
                        teacherProfile.cursos.length > 0
                          ? teacherProfile.cursos.join(", ")
                          : "Sin cursos registrados"}
                      </div>
                    </div>

                    <div>
                      <label>Enlaces</label>
                      <div className="profile-readonly-field">
                        {teacherProfile.redes?.linkedin && (
                          <div>
                            LinkedIn:{" "}
                            <a
                              href={teacherProfile.redes.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              ver perfil
                            </a>
                          </div>
                        )}
                        {teacherProfile.redes?.github && (
                          <div>
                            GitHub:{" "}
                            <a
                              href={teacherProfile.redes.github}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              ver repos
                            </a>
                          </div>
                        )}
                        {!teacherProfile.redes?.linkedin &&
                          !teacherProfile.redes?.github && (
                            <span className="muted">
                              Sin enlaces registrados
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {teacherProfile.bio && (
                    <div style={{ marginTop: 10 }}>
                      <label>Bio docente</label>
                      <p className="profile-readonly-multiline">
                        {teacherProfile.bio}
                      </p>
                    </div>
                  )}

                  <div className="profile-card-footer">
                    <p className="profile-help">
                      ¿Algo desactualizado? Edita todo desde el módulo Docente.
                    </p>
                    <Link to="/docente" className="btn-primary">
                      Editar en módulo Docente
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">
                    Aún no has completado tu perfil docente. Eso ayudará a contextualizar
                    tus lecturas y horarios.
                  </p>
                  <Link to="/docente" className="btn-primary">
                    Completar perfil docente
                  </Link>
                </>
              )}
            </section>
          )}

          {role === "estudiante" && (
            <section className="profile-card">
              <header>
                <h2>Resumen de perfil estudiante</h2>
                <p className="profile-help">
                  Resume cómo estás usando el tutor y qué esperas mejorar.
                </p>
              </header>

              {loadingStudent ? (
                <p className="muted">Cargando perfil de estudiante…</p>
              ) : studentProfile ? (
                <>
                  <div className="profile-grid-two">
                    <div>
                      <label>Carrera / programa</label>
                      <div className="profile-readonly-field">
                        {studentProfile.carrera || (
                          <span className="muted">No indicado</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Ciclo / semestre</label>
                      <div className="profile-readonly-field">
                        {studentProfile.ciclo || (
                          <span className="muted">No indicado</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Objetivo con la lectura crítica</label>
                      <div className="profile-readonly-field">
                        {studentProfile.objetivos || (
                          <span className="muted">
                            Sin objetivo definido
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Temas que más te interesan</label>
                      <div className="profile-readonly-field">
                        {studentProfile.intereses || (
                          <span className="muted">
                            Sin preferencias registradas
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Horario o momentos donde más estudias</label>
                      <div className="profile-readonly-field">
                        {studentProfile.horario || (
                          <span className="muted">No especificado</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label>Correo de contacto</label>
                      <div className="profile-readonly-field">
                        {studentProfile.contacto || (
                          <span className="muted">No especificado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="profile-card-footer">
                    <p className="profile-help">
                      Puedes ajustar estos datos desde el módulo Estudiante cuando
                      quieras.
                    </p>
                    <Link to="/estudiante" className="btn-primary">
                      Editar en módulo Estudiante
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">
                    Aún no has completado tu perfil de estudiante. Eso ayudará a que el
                    tutor te dé mejor feedback.
                  </p>
                  <Link to="/estudiante" className="btn-primary">
                    Completar perfil de estudiante
                  </Link>
                </>
              )}
            </section>
          )}

          {/* Historial */}
          <section className="profile-card">
            <header>
              <h2>Actividad reciente</h2>
              <p className="profile-help">
                Vista rápida de lo último que has hecho con el tutor (simulado).
              </p>
            </header>

            <ul className="profile-history-list">
              {history.length === 0 ? (
                <li className="profile-history-item profile-history-empty">
                  No hay actividad registrada todavía.
                </li>
              ) : (
                history.map((item, idx) => (
                  <li key={idx} className="profile-history-item">
                    {typeof item === "string"
                      ? item
                      : item.label || JSON.stringify(item)}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
