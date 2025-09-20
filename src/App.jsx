import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// Importa tus módulos
import Estudiante from "./frontend/estudiante";
import Docente from "./frontend/docente";
import IA from "./frontend/ia";
import Automatizacion from "./frontend/automatizacion";
import Gamificacion from "./frontend/gamificacion";
import Contacto from "./frontend/contacto";
import Perfil from "./frontend/perfil";

function App() {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/estudiante">Estudiante</Link></li>
            <li><Link to="/docente">Docente</Link></li>
            <li><Link to="/ia">IA</Link></li>
            <li><Link to="/automatizacion">Automatización</Link></li>
            <li><Link to="/gamificacion">Gamificación</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/perfil">Perfil</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<div>🏠 Bienvenido al Tutor Virtual</div>} />
          <Route path="/estudiante" element={<Estudiante />} />
          <Route path="/docente" element={<Docente />} />
          <Route path="/ia" element={<IA />} />
          <Route path="/automatizacion" element={<Automatizacion />} />
          <Route path="/gamificacion" element={<Gamificacion />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
