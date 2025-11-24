# Tutor Virtual de Lectura Crítica

Este proyecto es una aplicación web desarrollada con el stack **MERN** (MongoDB, Express, React, Node.js), diseñada para mejorar las habilidades de comprensión lectora mediante actividades personalizadas y herramientas de seguimiento tanto para estudiantes como para docentes.

## Tecnologías utilizadas

- **Frontend:** React.js  
- **Backend:** Node.js + Express  
- **Base de datos:** MongoDB  
- **Control de versiones:** Git / GitHub  

## Funcionalidades principales

### Módulo Estudiante

- Registro e inicio de sesión  
- Perfil del estudiante  
- Acceso al tablero de lecturas asignadas  
- Desarrollo de actividades de comprensión lectora  
- Visualización de resultados  

### Módulo Docente

- Registro e inicio de sesión  
- Perfil del docente  
- Carga de lecturas  
- Asignación de lecturas  
- Gestión de estudiantes  
- Revisión de resultados y progreso  

---

## Instalación y ejecución

1. **Clonar el repositorio**

```bash
git clone https://github.com/kenyiYR/TUTOR-VIRTUAL-DE-LECT.git
cd TUTOR-VIRTUAL-DE-LECT

# Frontend
cd src/frontend
npm install

# Backend
cd ../backend
npm install

# Backend (desde la raíz del proyecto)
docker compose up --build

# Frontend (en otra terminal, dentro de src/frontend)
npm run dev -- --host 0.0.0.0 --port 5173
