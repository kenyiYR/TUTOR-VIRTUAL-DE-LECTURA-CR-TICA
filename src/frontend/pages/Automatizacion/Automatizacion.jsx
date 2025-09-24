// src/frontend/pages/Automatizacion/Automatizacion.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Button, ListGroup, Form } from "react-bootstrap";

export default function Automatizacion() {
  const [notifications, setNotifications] = useState([]);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [inactiveDays, setInactiveDays] = useState(30);

  useEffect(()=> {
    setNotifications([{ id:1, text:"Recordatorio: completa tu análisis", date: new Date().toLocaleString() }]);
  },[]);

  const sendNotification = () => setNotifications(p=>[{ id:Date.now(), text:"Notificación automática", date: new Date().toLocaleString() }, ...p]);

  return (
    <Container className="my-5">
      <h2>Automatización</h2>
      <p className="text-muted">Notificaciones automáticas, flujos de trabajo, registro y seguimiento.</p>

      <Card className="mb-3"><Card.Body><h5>Notificaciones automáticas</h5><Button onClick={sendNotification}>Enviar notificación</Button><ListGroup className="mt-3">{notifications.map(n=><ListGroup.Item key={n.id}>{n.date} — {n.text}</ListGroup.Item>)}</ListGroup></Card.Body></Card>

      <Card className="mb-3"><Card.Body><h5>Flujo de trabajo</h5><p>Paso actual: {workflowStep}</p><div className="d-flex gap-2"><Button onClick={()=>setWorkflowStep(s=>Math.max(1,s-1))}>Anterior</Button><Button onClick={()=>setWorkflowStep(s=>s+1)}>Siguiente</Button></div></Card.Body></Card>

      <Card><Card.Body><h5>Registro y seguimiento</h5><Form.Group className="mb-2"><Form.Label>Días para inactividad</Form.Label><Form.Control type="number" value={inactiveDays} onChange={e=>setInactiveDays(Number(e.target.value))} /></Form.Group><p className="text-muted">Se pueden configurar reglas para registrar nuevos usuarios y alertar por inactividad.</p></Card.Body></Card>
    </Container>
  );
}
