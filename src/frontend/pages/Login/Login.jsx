// src/frontend/pages/Login/Login.jsx
import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "estudiante",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones en el frontend
    if (!validateEmail(form.email)) {
      setError("Correo no válido");
      return;
    }
    if (!form.password || form.password.length < 4) {
      setError("Contraseña requerida (mínimo 4 caracteres)");
      return;
    }

    const res = await login(form.role, form.email, form.password);
    if (!res.ok) {
      setError(res.message);
      return;
    }

    setSuccess("Inicio de sesión exitoso. Redirigiendo...");
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: 520 }} className="p-4 shadow">
        <h3 className="mb-3 text-center">Iniciar sesión</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <ToggleButtonGroup
          type="radio"
          name="role"
          value={form.role}
          onChange={(val) => setForm((prev) => ({ ...prev, role: val }))}
          className="mb-3 d-flex justify-content-center"
        >
          <ToggleButton
            id="t1"
            value="estudiante"
            variant={
              form.role === "estudiante" ? "primary" : "outline-primary"
            }
          >
            Estudiante
          </ToggleButton>
          <ToggleButton
            id="t2"
            value="docente"
            variant={form.role === "docente" ? "success" : "outline-success"}
          >
            Docente
          </ToggleButton>
        </ToggleButtonGroup>

        <Form onSubmit={handleSubmit} data-testid="login-form">
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
              data-testid="email-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              required
              data-testid="password-input"
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
            variant="primary"
            data-testid="submit-btn"
          >
            Ingresar
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <a href="/register">¿No tienes cuenta? Regístrate</a>
        </div>
      </Card>
    </Container>
  );
}

// 📧 Validador de email básico
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
