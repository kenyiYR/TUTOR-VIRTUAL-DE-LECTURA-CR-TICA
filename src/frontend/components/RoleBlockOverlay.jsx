import '../styles/auth.css';

export default function RoleBlockOverlay({ required, actual }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign:'center' }}>
        <h1 className="auth-title">Acceso bloqueado</h1>
        <p className="auth-sub">
          Estás autenticado como <b>{actual || 'desconocido'}</b> y esta sección requiere <b>{required}</b>.
        </p>
        <div className="auth-note">Cierra sesión y entra con el rol correcto.</div>
      </div>
    </div>
  );
}
