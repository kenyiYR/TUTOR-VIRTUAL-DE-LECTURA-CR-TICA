import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../../styles/home.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="home-hero">
        <h1>Tutor Virtual — Plataforma Educativa</h1>
        <p>IA · Gamificación · Automatización para mejorar el aprendizaje</p>

        {/* bloque de “sobre el proyecto” que ya tenías */}
        <div className="card" style={{marginTop:16}}>
          <h3>Sobre el Proyecto (Acerca de la empresa)</h3>
          <p>Tutor Virtual integra IA y metodologías activas para promover la comprensión crítica y el aprendizaje adaptativo.</p>

          <h3>Misión</h3>
          <p>Ofrecer herramientas educativas inteligentes que desarrollen pensamiento crítico y lectura comprensiva.</p>

          <h3>Visión</h3>
          <p>Ser la plataforma de referencia en educación digital y análisis crítico asistido por IA.</p>

          <h3>Objetivos educativos</h3>
          <ul>
            <li>Mejorar la comprensión lectora.</li>
            <li>Detectar y corregir sesgos en textos.</li>
            <li>Entregar retroalimentación personalizada.</li>
            <li>Motivar mediante gamificación.</li>
          </ul>
        </div>
      </section>

      {/* Grilla de módulos */}
      <section className="tiles-grid">
        <article className="tile-card">
          <h4 className="tile-title">Módulo Estudiante</h4>
          <p className="tile-desc">Textos sugeridos, subida, análisis y resultados.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/estudiante/lecturas">Ir</a>
          </div>
        </article>

        <article className="tile-card">
          <h4 className="tile-title">Módulo Docente</h4>
          <p className="tile-desc">Panel, gestión de contenido y reportes.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/docente/lecturas">Ir</a>
          </div>
        </article>

        <article className="tile-card">
          <h4 className="tile-title">Módulo IA</h4>
          <p className="tile-desc">Generación de preguntas, análisis de sesgos y evaluación automática.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/ia">Ir</a>
          </div>
        </article>

        <article className="tile-card">
          <h4 className="tile-title">Automatización</h4>
          <p className="tile-desc">Notificaciones, flujos y seguimiento de inactividad.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/automatizacion">Ir</a>
          </div>
        </article>

        <article className="tile-card">
          <h4 className="tile-title">Gamificación</h4>
          <p className="tile-desc">Insignias, niveles y ranking.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/gamificacion">Ir</a>
          </div>
        </article>

        <article className="tile-card">
          <h4 className="tile-title">Contacto / Soporte</h4>
          <p className="tile-desc">FAQ, formulario y chat.</p>
          <div className="tile-actions">
            <a className="btn btn-primary" href="/contacto">Ir</a>
          </div>
        </article>
      </section>
    </div>
  );
}
