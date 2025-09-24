// src/frontend/pages/PerfilUsuario/Perfil.jsx
import React, { useState } from "react";
import { Container, Card, Form, Button, ListGroup } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";

export default function Perfil() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const history = JSON.parse(localStorage.getItem(`history_${user?.email}`) || "[]");

  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(()=>setSaved(false),1500); };

  return (
    <Container className="my-5">
      <h2>Perfil de Usuario</h2>
      <Card className="mb-3 p-3">
        <h5>Datos personales</h5>
        <Form onSubmit={save}><Form.Group className="mb-2"><Form.Label>Nombre</Form.Label><Form.Control value={name} onChange={e=>setName(e.target.value)} /></Form.Group><Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control value={email} onChange={e=>setEmail(e.target.value)} /></Form.Group><Button type="submit">Guardar</Button>{saved && <span className="ms-2 text-success"> Guardado</span>}</Form>
        <hr />
        <h5>Configuración de cuenta</h5><p className="text-muted">Opciones de notificaciones y verificación de cuenta (simulado).</p>
        <hr />
        <h5>Historial de actividad</h5>
        <ListGroup>{history.length===0 ? <ListGroup.Item>No hay actividad</ListGroup.Item> : history.map((h,i)=><ListGroup.Item key={i}>{h}</ListGroup.Item>)}</ListGroup>
        <div className="mt-3"><Button variant="danger" onClick={logout}>Cerrar sesión</Button></div>
      </Card>
    </Container>
  );
}
