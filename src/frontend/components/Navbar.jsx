import React from "react";
import { Navbar as BNavbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getUser, getUserRole, logoutClient } from "../services/auth.js";

export default function Navbar() {
  const navigate = useNavigate();

  // Datos de sesión desde tus servicios
  const user = getUser();                  // puede traer { rol } o { role }
  const roleFromSvc = getUserRole();       // string o null

  // Normaliza el rol para que funcione con 'rol' o 'role'
  const role = roleFromSvc || user?.rol || user?.role || null;

  function handleLogout() {
    try {
      logoutClient?.();
    } finally {
      navigate("/login");
    }
  }

  return (
    <BNavbar bg="dark" variant="dark" expand="lg" className="site-nav">
      <Container>
        <BNavbar.Brand as={Link} to="/">Tutor Virtual</BNavbar.Brand>

        <BNavbar.Toggle aria-controls="main-nav" />
        <BNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {role === "estudiante" && (
              <Nav.Link as={Link} to="/estudiante">Módulo Estudiante</Nav.Link>
            )}

            {role === "docente" && (
              <Nav.Link as={Link} to="/docente">Módulo Docente</Nav.Link>
            )}

            {/* módulos visibles para ambos (requieren login si tu app así lo decide) */}
            <Nav.Link as={Link} to="/ia">Módulo IA</Nav.Link>
            <Nav.Link as={Link} to="/automatizacion">Automatización</Nav.Link>
            <Nav.Link as={Link} to="/gamificacion">Gamificación</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
          </Nav>

          <Nav className="ms-auto" style={{ alignItems: "center", gap: 16 }}>
            {user ? (
              <>
                <span style={{ color: "rgba(255,255,255,.8)" }}>
                  Sesión: <b>{role}</b>
                </span>
                {/* Te da igual si tu test busca <button> o <Button>, ambos exponen role="button" */}
                <Button variant="primary" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Registro</Nav.Link>
              </>
            )}
          </Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
}
