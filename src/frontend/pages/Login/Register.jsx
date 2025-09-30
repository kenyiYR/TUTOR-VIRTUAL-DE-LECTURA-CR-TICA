import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth.js';
import AuthLayout from '../../components/AuthLayout.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setErr('');
    setLoading(true);
    try{
      await login({ email, password });
      navigate('/perfil');   // ajusta destino si quieres
    }catch(e){
      setErr(e.message);
    }finally{
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede a tu cuenta para continuar.">
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" className="auth-input" type="email"
               value={email} onChange={e=>setEmail(e.target.value)} required />

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
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <Link className="link" to="/register">Crear cuenta</Link>
        </div>

        {err && <div className="auth-error">{err}</div>}
        <p className="auth-note">¿Olvidaste la contraseña? Esa historia va en otro sprint.</p>
      </form>
    </AuthLayout>
  );
}

