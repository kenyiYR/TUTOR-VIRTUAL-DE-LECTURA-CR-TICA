import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { me, getUser, getUserRole } from '../services/auth.js';
import RoleBlockOverlay from './RoleBlockOverlay.jsx';


export default function ProtectedRoute({ role, children }) {
  const [state, setState] = useState({ loading: true, authed: false, wrongRole: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      const userLocal = getUser();
      if (!userLocal) {
        const u = await me();
        if (!alive) return;
        if (!u) return setState({ loading: false, authed: false, wrongRole: false });
      }
      const hasAuth = !!getUser();
      const wrong = role ? getUserRole() !== role : false;
      setState({ loading: false, authed: hasAuth, wrongRole: wrong });
    })().catch(() => setState({ loading: false, authed: false, wrongRole: false }));
    return () => { alive = false; };
  }, [role]);

  if (state.loading) return <div style={{ padding: 24 }}>Verificando acceso…</div>;


  if (!state.authed) return <Navigate to="/login" replace />;


  if (state.wrongRole) return <RoleBlockOverlay required={role} actual={getUserRole()} />;

  return children;
}
