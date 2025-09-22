import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/components/Navbar.jsx";
import Footer from "./frontend/components/Footer.jsx";

// Importar páginas
import Home from "./frontend/pages/Home/Home.jsx";
import Estudiante from "./frontend/pages/ModuloEstudiante/Estudiante.jsx";
import Docente from "./frontend/pages/ModuloDocente/Docente.jsx";
import IA from "./frontend/pages/ModuloIA/IA.jsx";
import Automatizacion from "./frontend/pages/Automatizacion/Automatizacion.jsx";
import Gamificacion from "./frontend/pages/Gamificacion/Gamificacion.jsx";
import Contacto from "./frontend/pages/Contacto/Contacto.jsx";
import Login from "./frontend/pages/Login/Login.jsx";
import Perfil from "./frontend/pages/PerfilUsuario/Perfil.jsx";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estudiante" element={<Estudiante />} />
          <Route path="/docente" element={<Docente />} />
          <Route path="/ia" element={<IA />} />
          <Route path="/automatizacion" element={<Automatizacion />} />
          <Route path="/gamificacion" element={<Gamificacion />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
