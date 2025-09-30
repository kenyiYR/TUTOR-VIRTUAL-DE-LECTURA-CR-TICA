# React + Vite + Express + MongoDB

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh  
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh  

## Architecture Used

The project follows the **MERN architecture**:

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (via Mongoose)  
- **Communication:** REST API using `fetch`/`axios`  
- **Deployment:** Cloud ready  

### Diagram

<img width="1050" height="842" alt="image" src="https://github.com/user-attachments/assets/397edcf2-ba55-46d2-ae9e-23c788d8d537" />


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
