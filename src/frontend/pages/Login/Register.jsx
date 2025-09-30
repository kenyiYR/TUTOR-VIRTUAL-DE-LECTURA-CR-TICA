import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.js';
import AuthLayout from '../../components/AuthLayout.jsx';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setErr(''); setLoading(true);
    try{
      await register({ nombre, email, password, rol });
      navigate('/perfil');
    }catch(e){ setErr(e.message); }
    finally{ setLoading(false); }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete para empezar con la lectura crítica.">
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" className="auth-input"
               value={nombre} onChange={e=>setNombre(e.target.value)} required />

        <label htmlFor="email">Email</label>
        <input id="email" className="auth-input" type="email"
               value={email} onChange={e=>setEmail(e.target.value)} required />

        <label htmlFor="rol">Rol</label>
        <select id="rol" className="auth-input"
                value={rol} onChange={e=>setRol(e.target.value)}>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
        </select>

        <label htmlFor="password">Contraseña</label>
        <div className="auth-row">
          <input id="password" className="auth-input" style={{flex:1}}
                 type={show?'text':'password'} value={password}
                 onChange={e=>setPassword(e.target.value)} required />
          <button type="button" className="btn-primary" onClick={()=>setShow(s=>!s)}>
            {show ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        <div className="auth-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando…' : 'Registrarme'}
          </button>
          <Link className="link" to="/login">Ya tengo cuenta</Link>
        </div>

        {err && <div className="auth-error">{err}</div>}
        <p className="auth-note"></p>
      </form>
    </AuthLayout>
  );
}
