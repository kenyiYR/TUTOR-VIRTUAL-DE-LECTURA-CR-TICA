// src/frontend/pages/Contacto/Contacto.jsx
import React, { useState } from "react";
import { Container, Card, Form, Button, Accordion } from "react-bootstrap";

export default function Contacto() {
  const [sent, setSent] = useState(false);
  const handleSend = (e) => { e.preventDefault(); setSent(true); setTimeout(()=>setSent(false),3000); };

  return (
    <Container className="my-5">
      <h2>Contacto / Soporte</h2>
      <Card className="mb-3"><Card.Body><h5>Preguntas Frecuentes</h5><Accordion><Accordion.Item eventKey="0"><Accordion.Header>¿Cómo crear cuenta?</Accordion.Header><Accordion.Body>Regístrate desde la página Registro y valida tu correo (simulado).</Accordion.Body></Accordion.Item></Accordion></Card.Body></Card>

      <Card className="mb-3"><Card.Body><h5>Formulario de contacto</h5><Form onSubmit={handleSend}><Form.Group className="mb-2"><Form.Label>Nombre</Form.Label><Form.Control required/></Form.Group><Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control type="email" required/></Form.Group><Form.Group className="mb-2"><Form.Label>Mensaje</Form.Label><Form.Control as="textarea" rows={3} required/></Form.Group><Button type="submit">Enviar</Button>{sent && <span className="ms-2 text-success"> Enviado (simulado)</span>}</Form></Card.Body></Card>

      <Card><Card.Body><h5>Chat de soporte</h5><p className="text-muted">Chat en vivo próximamente (simulado).</p><h6>Centro de ayuda</h6><ul><li><a href="#">Guía rápida</a></li><li><a href="#">Políticas</a></li></ul></Card.Body></Card>
    </Container>
  );
}
