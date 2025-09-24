// src/frontend/components/Navbar.jsx
import React from "react";
import { Navbar as BNavbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <BNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BNavbar.Brand as={Link} to="/">Tutor Virtual</BNavbar.Brand>
        <BNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {user?.role === "estudiante" && (
              <Nav.Link as={Link} to="/estudiante">Módulo Estudiante</Nav.Link>
            )}

            {user?.role === "docente" && (
              <Nav.Link as={Link} to="/docente">Módulo Docente</Nav.Link>
            )}

            {/* módulos disponibles para ambos (requieren login) */}
            <Nav.Link as={Link} to="/ia">Módulo IA</Nav.Link>
            <Nav.Link as={Link} to="/automatizacion">Automatización</Nav.Link>
            <Nav.Link as={Link} to="/gamificacion">Gamificación</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
          </Nav>

          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/perfil">{user.name || user.email}</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={logout}>Cerrar sesión</Button>
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
