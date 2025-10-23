import { getToken } from './auth.js';
const BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.VITE_API_URL ||
  "http://localhost:4000";
const H = (t)=>({ ...(t?{Authorization:`Bearer ${t}`}:{}) });

export async function listMyReadings(){
  const r = await fetch(`${BASE}/api/readings`, { headers: H(getToken()) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo listar lecturas');
  return d.readings;
}

export async function uploadReading({ titulo, descripcion, file }){
  const fd = new FormData();
  fd.append('titulo', titulo);
  if (descripcion) fd.append('descripcion', descripcion);
  fd.append('file', file);
  const r = await fetch(`${BASE}/api/readings`, {
    method:'POST', headers: H(getToken()), body: fd
  });
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo subir lectura');
  return d.reading;
}
