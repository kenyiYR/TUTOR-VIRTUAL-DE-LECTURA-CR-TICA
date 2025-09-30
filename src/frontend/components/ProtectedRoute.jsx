import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { me } from '../services/auth.js';

// Uso:
// <ProtectedRoute role="docente"><Docente /></ProtectedRoute>
// <ProtectedRoute><Perfil /></ProtectedRoute>
export default function ProtectedRoute({ role, children }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await me();
        if (!alive) return;
        if (!user) return setState({ loading: false, allowed: false });
        if (role && user.rol !== role) return setState({ loading: false, allowed: false });
        setState({ loading: false, allowed: true });
      } catch {
        setState({ loading: false, allowed: false });
      }
    })();
    return () => { alive = false; };
  }, [role]);

  if (state.loading) return <div style={{ padding: 24 }}>Verificando acceso…</div>;
  if (!state.allowed) return <Navigate to="/login" replace />;
  return children;
}
 