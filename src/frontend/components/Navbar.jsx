import React from "react";
import { Navbar as BNavbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getUser, getUserRole, logoutClient } from "../services/auth.js";
import NotificationBell from "./NotificationBell.jsx";

export default function Navbar() {
  const navigate = useNavigate();

  const user = getUser();
  const roleFromSvc = getUserRole();
  const role = roleFromSvc || user?.rol || user?.role || null;

  function handleLogout() {
    try {
      logoutClient?.();
    } finally {
      navigate("/login");
    }
  }

  return (
    <BNavbar
      expand="lg"
      variant="dark"
      className="site-nav navbar-dark"
    >
      <Container>
        <BNavbar.Brand as={Link} to="/" className="site-nav-brand">
          Tutor Virtual
        </BNavbar.Brand>

        <BNavbar.Toggle aria-controls="main-navbar" />

        <BNavbar.Collapse id="main-navbar">
          <Nav className="me-auto site-nav-links">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>

            {role === "estudiante" && (
              <Nav.Link as={Link} to="/estudiante/lecturas">
                Estudiante
              </Nav.Link>
            )}

            {role === "docente" && (
  <>
    <Nav.Link as={Link} to="/docente/lecturas">
      Docente
    </Nav.Link>
    <Nav.Link as={Link} to="/docente/reportes">
      Reportes
    </Nav.Link>
  </>
)}


            
          </Nav>

          <Nav className="ms-auto site-nav-session">
  {user ? (
    <>
      <span className="site-nav-user">
        Sesión:&nbsp;
        <strong>{user?.nombre || user?.email}</strong>
        {role && <span className="site-nav-role"> · {role}</span>}
      </span>

      {role === "estudiante" && <NotificationBell />}

      <Button
        size="sm"
        className="btn-primary site-nav-logout"
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
    </>
  ) : (
    <>
      <Nav.Link as={Link} to="/login">
        Login
      </Nav.Link>
      <Nav.Link as={Link} to="/register">
        Registro
      </Nav.Link>
    </>
  )}
</Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
}
