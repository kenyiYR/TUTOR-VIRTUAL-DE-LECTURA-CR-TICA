import { getToken } from './auth.js';
const BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.VITE_API_URL ||
  "http://localhost:4000";
const H = (t)=>({ 'Content-Type':'application/json', ...(t?{Authorization:`Bearer ${t}`}:{}) });

export async function getMyTeacherProfile(){
  const t = getToken();
  const r = await fetch(`${BASE}/api/teacher/profile/me`, { headers: H(t) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'No se pudo cargar perfil');
  return d.profile;
}

export async function updateMyTeacherProfile(payload){
  const t = getToken();
  const r = await fetch(`${BASE}/api/teacher/profile/me`, {
    method:'PUT', headers: H(t), body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'No se pudo actualizar');
  return d.profile;
}
