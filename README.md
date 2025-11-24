# React + Vite + Express + MongoDB

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh  
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh  

## Architecture Used

Tutor Virtual de Lectura Crítica
Este proyecto es una aplicación web desarrollada con el stack MERN (MongoDB, Express, React, Node.js), diseñada para mejorar las habilidades de comprensión lectora mediante actividades personalizadas y herramientas de seguimiento tanto para estudiantes como docentes.
Tecnologías utilizadas
•	Frontend: React.js
•	Backend: Node.js + Express
•	Base de datos: MongoDB
•	Control de versiones: Git / GitHub
 Funcionalidades principales
Módulo Estudiante
•	Registro e inicio de sesión.
•	Perfil del estudiante.
•	Acceso al tablero de lecturas asignadas.
•	Desarrollo de actividades de comprensión lectora.
•	Visualización de resultados.
Módulo Docente
•	Registro e inicio de sesión.
•	Perfil del Docente
•	Cargar lecturas.
•	Asignación de lecturas.
•	Gestión de estudiantes.
•	Revisión de resultados y progreso.
________________________________________
Instalación y ejecución
1️Clonar el repositorio
git clone https://github.com/kenyiYR/TUTOR-VIRTUAL-DE-LECT.git
cd TUTOR-VIRTUAL-DE-LECT
2Instalar dependencias
Frontend:
cd src/backend
npm install
Backend:
cd src/frontend
npm install
Ejecutar la app
Frontend:
npm run dev -- --host 0.0.0.0 --port 5173
Backend:
Docker compose up --build
  

### Diagram

<img width="1050" height="842" alt="image" src="https://github.com/user-attachments/assets/397edcf2-ba55-46d2-ae9e-23c788d8d537" />


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
