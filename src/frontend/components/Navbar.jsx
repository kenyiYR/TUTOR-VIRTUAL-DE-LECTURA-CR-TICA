import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>Tutor Virtual</h1>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/estudiante">Estudiante</Link></li>
        <li><Link to="/docente">Docente</Link></li>
        <li><Link to="/ia">IA</Link></li>
        <li><Link to="/automatizacion">Automatización</Link></li>
        <li><Link to="/gamificacion">Gamificación</Link></li>
        <li><Link to="/contacto">Contacto</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
