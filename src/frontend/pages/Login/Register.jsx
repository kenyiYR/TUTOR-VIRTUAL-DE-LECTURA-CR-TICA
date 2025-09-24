// src/frontend/pages/Login/Register.jsx
import React, { useState } from "react";
import { Container, Card, Form, Button, ToggleButtonGroup, ToggleButton, Alert } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [role, setRole] = useState("estudiante");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const handle = (e) => {
    e.preventDefault();
    const res = register(name, role, email, password);
    if (!res.ok) setErr(res.message);
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: 560 }} className="p-4">
        <h3 className="mb-3">Crear nueva cuenta</h3>
        {err && <Alert variant="danger">{err}</Alert>}
        <ToggleButtonGroup type="radio" name="role" value={role} onChange={val=>setRole(val)} className="mb-3">
          <ToggleButton id="r1" value="estudiante" variant={role==="estudiante"?"primary":"outline-primary"}>Estudiante</ToggleButton>
          <ToggleButton id="r2" value="docente" variant={role==="docente"?"success":"outline-success"}>Docente</ToggleButton>
        </ToggleButtonGroup>

        <Form onSubmit={handle}>
          <Form.Group className="mb-2"><Form.Label>Nombre completo</Form.Label><Form.Control value={name} onChange={e=>setName(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Contraseña</Form.Label><Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></Form.Group>
          <Button type="submit" variant="success" className="w-100">Crear cuenta</Button>
        </Form>

        <div className="mt-3 text-center"><a href="/login">¿Ya tienes cuenta? Inicia sesión</a></div>
      </Card>
    </Container>
  );
}
