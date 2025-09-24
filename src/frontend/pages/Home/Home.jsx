// src/frontend/pages/Home/Home.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <Container className="my-5">
      <header className="text-center mb-4">
        <h1>Tutor Virtual — Plataforma Educativa</h1>
        <p className="text-muted">IA · Gamificación · Automatización para mejorar el aprendizaje</p>
      </header>

      <Card className="mb-4">
        <Card.Body>
          <h3>Sobre el Proyecto (Acerca de la empresa)</h3>
          <p>Tutor Virtual integra IA y metodologías activas para promover la comprensión crítica y el aprendizaje adaptativo.</p>

          <h5>Misión</h5>
          <p>Ofrecer herramientas educativas inteligentes que desarrollen pensamiento crítico y lectura comprensiva.</p>

          <h5>Visión</h5>
          <p>Ser la plataforma de referencia en educación digital y análisis crítico asistido por IA.</p>

          <h5>Objetivos educativos</h5>
          <ul>
            <li>Mejorar la comprensión lectora.</li>
            <li>Detectar y corregir sesgos en textos.</li>
            <li>Entregar retroalimentación personalizada.</li>
            <li>Motivar mediante gamificación.</li>
          </ul>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={4}><Card className="h-100"><Card.Body><h5>Módulo Estudiante</h5><p>Textos sugeridos, subida, análisis y resultados.</p><Link to="/estudiante"><Button>Ir</Button></Link></Card.Body></Card></Col>
        <Col md={4}><Card className="h-100"><Card.Body><h5>Módulo Docente</h5><p>Panel, gestión de contenido y reportes.</p><Link to="/docente"><Button>Ir</Button></Link></Card.Body></Card></Col>
        <Col md={4}><Card className="h-100"><Card.Body><h5>Módulo IA</h5><p>Generación de preguntas, análisis de sesgos y evaluación automática.</p><Link to="/ia"><Button>Ir</Button></Link></Card.Body></Card></Col>

        <Col md={4}><Card className="h-100"><Card.Body><h5>Automatización</h5><p>Notificaciones, flujos y seguimiento de inactividad.</p><Link to="/automatizacion"><Button>Ir</Button></Link></Card.Body></Card></Col>
        <Col md={4}><Card className="h-100"><Card.Body><h5>Gamificación</h5><p>Insignias, niveles y ranking.</p><Link to="/gamificacion"><Button>Ir</Button></Link></Card.Body></Card></Col>
        <Col md={4}><Card className="h-100"><Card.Body><h5>Contacto / Soporte</h5><p>FAQ, formulario y chat.</p><Link to="/contacto"><Button>Ir</Button></Link></Card.Body></Card></Col>
      </Row>

      <footer className="text-center mt-4">
        {user ? <small className="text-muted">Sesión iniciada como <strong>{user.role}</strong> — {user.email}</small> :
          <small className="text-muted">Inicia sesión para ver tu módulo personalizado.</small>}
      </footer>
    </Container>
  );
}
