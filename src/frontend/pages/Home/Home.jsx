import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home.css";

export default function Home() {
  return (
    <main className="home-container">
      {/* HERO PRINCIPAL */}
      <section className="home-hero">
        <div className="home-hero-main">
          <p className="home-hero-kicker">Lectura crítica · IA educativa</p>

          <h1 className="home-hero-title">Tutor Virtual de Lectura Crítica</h1>

          <p className="home-hero-subtitle">
            Una forma sencilla de trabajar lectura y argumentación con apoyo
            inteligente: el docente guía, el estudiante escribe y la IA acompaña
            sin reemplazar.
          </p>

          <div className="home-hero-row">
            <Link to="/login" className="btn-primary home-hero-cta">
              Entrar a la plataforma
            </Link>
            <span className="home-hero-hint">
              Diseñado para cursos de lectura crítica con docentes y
              estudiantes.
            </span>
          </div>

          <div className="home-hero-tags">
            <span className="hero-tag">Ruta clara</span>
            <span className="hero-tag">Docente al mando</span>
            <span className="hero-tag">IA integrada</span>
          </div>
        </div>
      </section>

      {/* BLOQUE 1: ¿QUÉ SE HACE CON EL TUTOR? */}
      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">¿Qué se hace con el Tutor?</h2>
          <p className="home-section-sub">
            El foco es simple: leer mejor, escribir mejor y entender qué tan
            sólidas son las ideas que se van construyendo.
          </p>
        </header>

        <div className="feature-list">
          <article className="feature-row">
            <h3 className="feature-title">Proponer lecturas</h3>
            <p className="feature-text">
              El docente elige textos o casos y marca qué tipo de análisis
              quiere que se trabaje.
            </p>
          </article>

          <article className="feature-row">
            <h3 className="feature-title">Responder por pasos</h3>
            <p className="feature-text">
              El estudiante responde en partes, con indicaciones claras y
              retroalimentación progresiva.
            </p>
          </article>

          <article className="feature-row">
            <h3 className="feature-title">Revisar y mejorar</h3>
            <p className="feature-text">
              El docente revisa y observa cómo cambian las respuestas a lo largo
              del tiempo, con apoyo de la IA para detectar puntos débiles.
            </p>
          </article>
        </div>
      </section>

      {/* BLOQUE 2: DOS VISTAS, UN MISMO CURSO */}
      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">Dos vistas, un mismo curso</h2>
          <p className="home-section-sub">
            La plataforma se adapta a lo que cada rol necesita ver, pero todos
            trabajan sobre la misma actividad.
          </p>
        </header>

        <div className="roles-grid">
          <article className="role-card">
            <p className="role-kicker">Vista del estudiante</p>
            <h3 className="role-title">Módulo Estudiante</h3>
            <p className="role-text">
              El estudiante organiza sus lecturas, envía respuestas y sigue sus
              progresos de forma clara.
            </p>
          </article>

          <article className="role-card">
            <p className="role-kicker">Vista del docente</p>
            <h3 className="role-title">Módulo Docente</h3>
            <p className="role-text">
              El docente arma tareas, revisa textos y tiene una visión rápida
              del avance del grupo.
            </p>
          </article>
        </div>
      </section>

      {/* BLOQUE 3: IA */}
      <section className="home-section">
        <div className="ai-block">
          <h2 className="home-section-title">La IA acompaña, no reemplaza</h2>
          <p className="home-section-sub">
            La idea no es que la IA resuelva la lectura por el estudiante, sino
            que ayude a pensar mejor lo que ya se escribió.
          </p>

          <ul className="ai-list">
            <li>
              <strong>Uso puntual:</strong> aparece solo cuando hace falta, no
              domina el proceso.
            </li>
            <li>
              <strong>Control del docente:</strong> el profesor decide qué se
              corrige y qué se toma en cuenta.
            </li>
            <li>
              <strong>Progreso visible:</strong> seguimiento claro de cómo
              cambia la argumentación.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="home-section home-section-cta">
        <h2 className="cta-title">¿Listo para comenzar?</h2>
        <p className="cta-subtitle">
          Entra ahora y prueba el tutor como docente o estudiante.
        </p>
        <Link to="/register" className="btn-primary cta-button">
          Crear cuenta
        </Link>
      </section>
    </main>
  );
}
