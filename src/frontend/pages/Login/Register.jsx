// src/frontend/pages/Login/Register.jsx
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

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
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

    // Validaciones en el front
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("El correo no es válido");
      return;
    }
    if (form.password !== form.repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!validatePassword(form.password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
      );
      return;
    }

    const res = await register(
      form.name,
      form.role,
      form.email,
      form.password,
      form.repeatPassword
    );

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setSuccess("Cuenta creada con éxito. Redirigiendo...");
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: 560 }} className="p-4 shadow">
        <h3 className="mb-3 text-center">Crear nueva cuenta</h3>

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
            id="r1"
            value="estudiante"
            variant={
              form.role === "estudiante" ? "primary" : "outline-primary"
            }
          >
            Estudiante
          </ToggleButton>
          <ToggleButton
            id="r2"
            value="docente"
            variant={form.role === "docente" ? "success" : "outline-success"}
          >
            Docente
          </ToggleButton>
        </ToggleButtonGroup>

        <Form onSubmit={handleSubmit} data-testid="register-form">
          <Form.Group className="mb-2">
            <Form.Label>Nombre completo</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej. Juan Pérez"
              data-testid="name-input"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
              data-testid="email-input"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              data-testid="password-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Repetir contraseña</Form.Label>
            <Form.Control
              type="password"
              name="repeatPassword"
              value={form.repeatPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              data-testid="repeatPassword-input"
            />
          </Form.Group>

          <Button type="submit" variant="success" className="w-100" data-testid="submit-btn">
            Crear cuenta
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </Card>
    </Container>
  );
}

// 🔐 Validaciones
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}
