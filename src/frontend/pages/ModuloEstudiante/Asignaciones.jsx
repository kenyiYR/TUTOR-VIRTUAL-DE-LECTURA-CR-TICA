import { useEffect, useState } from 'react';
import { listMyAssignments, toggleRead, submitWork } from '../../services/assignments.js';
import '../../styles/panel.css';

export default function AsignacionesAlumno(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function load(){
    setLoading(true);
    try{ setItems(await listMyAssignments()); }
    catch(e){ setMsg(e.message); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  const statusOf = (a)=>{
    if (a?.feedback?.at) return <span className="badge ok">revisado</span>;
    if (a?.submission?.at) return <span className="badge">entregado</span>;
    if (a?.readAt) return <span className="badge">leído</span>;
    return <span className="badge warn">pendiente</span>;
  };

  async function onToggle(id, idx){
    try{
      const date = await toggleRead(id);
      const next=[...items]; next[idx].readAt=date; setItems(next);
    }catch(e){ setMsg(e.message); }
  }

  async function onSubmit(id, idx){
    const input = document.getElementById(`file_${id}`);
    const note  = document.getElementById(`note_${id}`)?.value || '';
    const file  = input?.files?.[0]; if(!file) return setMsg('Selecciona archivo');
    try{
      const res = await submitWork(id, { file, notes: note });
      const next=[...items]; next[idx].submission=res; setItems(next);
      setMsg('Entrega enviada ✅'); input.value='';
    }catch(e){ setMsg(e.message); }
  }

  return (
    <div className="panel-wrap">
      {msg && <div className="card" style={{marginBottom:12}}>{msg}</div>}
      <div className="panel-grid">
        {loading ? <div className="card">Cargando…</div> :
        items.length===0 ? <div className="card">No tienes asignaciones.</div> :
        items.map((a,i)=>(
          <div key={a._id} className="card">
            <h3>{a.reading?.titulo || 'Lectura'}</h3>
            <p>{a.reading?.descripcion}</p>
            <div className="row">
              <a className="link" href={a.reading?.url} target="_blank" rel="noreferrer">Abrir lectura</a>
              <span>{statusOf(a)}</span>
            </div>

            <div className="row" style={{marginTop:8}}>
              <button className="btn gray" onClick={()=>onToggle(a._id, i)}>
                {a.readAt ? 'Marcar como no leído' : 'Marcar como leído'}
              </button>
            </div>

            <div className="hr" />
            <div className="row">
              <input id={`file_${a._id}`} className="file" type="file" />
              <input id={`note_${a._id}`} className="input" placeholder="Notas (opcional)" style={{flex:1}}/>
              <button className="btn" onClick={()=>onSubmit(a._id, i)}>{a.submission?.at ? 'Reenviar' : 'Enviar tarea'}</button>
            </div>

            {a.feedback?.at && (
              <p style={{marginTop:8}}>
                <b>Feedback:</b> {a.feedback.text || '—'} · <b>Puntaje:</b> {a.feedback.score ?? '—'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
