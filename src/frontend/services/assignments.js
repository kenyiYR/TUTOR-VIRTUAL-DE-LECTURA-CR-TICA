import { getToken } from './auth.js';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const H = (t)=>({ 'Content-Type':'application/json', ...(t?{Authorization:`Bearer ${t}`}:{}) });

export async function assignReading({ readingId, studentIds, dueDate }){
  const r = await fetch(`${BASE}/api/assignments/assign`, {
    method:'POST', headers: H(getToken()),
    body: JSON.stringify({ readingId, studentIds, dueDate })
  });
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo asignar');
  return true;
}

export async function listMyAssignments(){
  const r = await fetch(`${BASE}/api/assignments/my`, { headers: { Authorization:`Bearer ${getToken()}` }});
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo listar asignaciones');
  return d.assignments;
}

export async function toggleRead(id){
  const r = await fetch(`${BASE}/api/assignments/${id}/read`, { method:'PATCH', headers: { Authorization:`Bearer ${getToken()}` }});
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo cambiar estado');
  return d.readAt;
}

export async function submitWork(id, { file, notes }){
  const fd = new FormData();
  if (notes) fd.append('notes', notes);
  fd.append('file', file);
  const r = await fetch(`${BASE}/api/assignments/${id}/submit`, {
    method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body: fd
  });
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo enviar entrega');
  return d.submission;
}

export async function listTeacherBoard(readingId){
  const url = new URL(`${BASE}/api/assignments/teacher`);
  if (readingId) url.searchParams.set('readingId', readingId);
  const r = await fetch(url, { headers:{ Authorization:`Bearer ${getToken()}` }});
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo cargar tablero');
  return d.items;
}

export async function sendFeedback(id, { text, score }){
  const r = await fetch(`${BASE}/api/assignments/${id}/feedback`,{
    method:'POST', headers: H(getToken()),
    body: JSON.stringify({ text, score: score===''?undefined:Number(score) })
  });
  const d = await r.json(); if (!r.ok) throw new Error(d.error||'No se pudo enviar feedback');
  return d.feedback;
}
