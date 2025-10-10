import React from "react";
import { Navbar as BNavbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { clearToken } from '../services/auth.js';
import { getUser, getUserRole, logoutClient } from "../services/auth.js"; 
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const role = getUserRole();

  function handleLogout() {
    logoutClient();
    navigate('/login');
  }

  return (
    <BNavbar bg="dark" variant="dark" expand="lg" className="site-nav">
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
            <div style={{ marginLeft:'auto', display:'flex', gap:16, alignItems:'center' }}></div>
            {user ? (
              <>
                <span style={{ opacity:.8 }}>Sesión: <b>{role}</b></span>
                <button className="btn-primary" onClick={handleLogout}>Cerrar sesión</button>
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
