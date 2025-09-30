const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

// utilidades token en localStorage
export const tokenKey = 'tvlc_token';
export const setToken = (t) => localStorage.setItem(tokenKey, t);
export const getToken = () => localStorage.getItem(tokenKey);
export const clearToken = () => localStorage.removeItem(tokenKey);

export async function register({ nombre, email, password, rol = 'estudiante' }) {
  const r = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ nombre, email, password, rol })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Registro falló');
  setToken(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Login falló');
  setToken(data.token);
  return data.user;
}

export async function me() {
  const t = getToken();
  if (!t) return null;
  const r = await fetch(`${BASE}/api/auth/me`, {
    headers: headers(t)
  });
  if (r.status === 401) { clearToken(); return null; }
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Perfil falló');
  return data.user;
}
