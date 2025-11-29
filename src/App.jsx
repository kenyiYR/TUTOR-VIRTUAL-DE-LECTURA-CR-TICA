// src/App.jsx
import React from "react";

import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/components/Navbar.jsx";
import Footer from "./frontend/components/Footer.jsx";
import ProtectedRoute from "./frontend/components/ProtectedRoute.jsx";

import AsignacionDetalleEstudiante from "./frontend/pages/ModuloEstudiante/AsignacionDetalleEstudiante";
import Home from "./frontend/pages/Home/Home.jsx";
import Estudiante from "./frontend/pages/ModuloEstudiante/Estudiante.jsx";
import Docente from "./frontend/pages/ModuloDocente/Docente.jsx";
import IA from "./frontend/pages/ModuloIA/IA.jsx";
import Automatizacion from "./frontend/pages/Automatizacion/Automatizacion.jsx";
import Gamificacion from "./frontend/pages/Gamificacion/Gamificacion.jsx";
import Contacto from "./frontend/pages/Contacto/Contacto.jsx";
import Login from "./frontend/pages/Login/Login.jsx";
import Register from "./frontend/pages/Login/Register.jsx";
import Perfil from "./frontend/pages/PerfilUsuario/Perfil.jsx";

import LecturasDocente from "./frontend/pages/ModuloDocente/Lecturas.jsx";
import TableroLecturas from "./frontend/pages/ModuloDocente/TableroLecturas.jsx";
import AsignacionesAlumno from "./frontend/pages/ModuloEstudiante/Asignaciones.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* rutas protegidas por rol */}
          <Route
            path="/estudiante"
            element={
              <ProtectedRoute role="estudiante">
                <Estudiante />
              </ProtectedRoute>
            }
          />
          <Route path="/docente" element={
              <ProtectedRoute role="docente">
              <Docente/>
             </ProtectedRoute>
               } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil/>
            </ProtectedRoute>
              } />
              <Route path="/docente/lecturas" element={
              <ProtectedRoute role="docente"><LecturasDocente/></ProtectedRoute>
               }/>
              <Route path="/docente/tablero" element={
              <ProtectedRoute role="docente"><TableroLecturas/></ProtectedRoute>
              }/>

              <Route
    path="/estudiante/lecturas/:assignmentId"
    element={
      <ProtectedRoute role="estudiante">
        <AsignacionDetalleEstudiante />
      </ProtectedRoute>
    }
  />

              <Route path="/estudiante/lecturas" element={
               <ProtectedRoute role="estudiante"><AsignacionesAlumno/></ProtectedRoute>
                }/>


          {/* otras rutas pueden requerir login global si quieres; aquí las dejamos públicas */}
          <Route path="/ia" element={<IA />} />
          <Route path="/automatizacion" element={<Automatizacion />} />
          <Route path="/gamificacion" element={<Gamificacion />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
