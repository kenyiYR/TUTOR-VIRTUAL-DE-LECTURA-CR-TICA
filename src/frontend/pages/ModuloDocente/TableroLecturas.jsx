import { useEffect, useState } from 'react';
import { listMyReadings } from '../../services/readings.js';
import { listTeacherBoard, sendFeedback } from '../../services/assignments.js';
import '../../styles/panel.css';

export default function TableroLecturas(){
  const [readings, setReadings] = useState([]);
  const [readingId, setReadingId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(()=>{ (async()=>{
    setReadings(await listMyReadings());
  })(); },[]);

  async function load(){
    setLoading(true); setMsg('');
    try{ setItems(await listTeacherBoard(readingId||undefined)); }
    catch(e){ setMsg(e.message); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[readingId]);

  async function onFeedback(id, idx){
    const text = document.getElementById(`fb_txt_${id}`)?.value || '';
    const score = document.getElementById(`fb_score_${id}`)?.value || '';
    try{
      const fb = await sendFeedback(id, { text, score });
      const next=[...items]; next[idx].feedback=fb; setItems(next);
      setMsg('Feedback enviado ✅');
    }catch(e){ setMsg(e.message); }
  }

  const statusOf = (a)=>{
    if (a?.feedback?.at) return <span className="badge ok">revisado</span>;
    if (a?.submission?.at) return <span className="badge">entregado</span>;
    if (a?.readAt) return <span className="badge">leído</span>;
    return <span className="badge warn">pendiente</span>;
  };

  return (
    <div className="panel-wrap">
      <div className="card" style={{marginBottom:16}}>
        <h3>Tablero de lecturas</h3>
        <div className="row">
          <select className="select" value={readingId} onChange={e=>setReadingId(e.target.value)}>
            <option value="">Todas mis lecturas</option>
            {readings.map(r=> <option key={r._id} value={r._id}>{r.titulo}</option>)}
          </select>
          <button className="btn gray" onClick={load}>Actualizar</button>
          {msg && <span style={{color:'#9ca3af'}}>{msg}</span>}
        </div>
      </div>

      <div className="panel-grid">
        {loading ? <div className="card">Cargando…</div> :
        items.length===0 ? <div className="card">Sin asignaciones aún.</div> :
        items.map((a, i)=>(
          <div key={a._id} className="card">
            <h3>{a.reading?.titulo || 'Lectura'}</h3>
            <p><b>Estudiante:</b> {a.student?.nombre} <span style={{color:'#9ca3af'}}>({a.student?.email})</span></p>
            <p><b>Estado:</b> {statusOf(a)}</p>
            <div className="hr" />
            <div className="row">
              <input id={`fb_score_${a._id}`} className="input" type="number" min="0" max="100" placeholder="Puntaje" defaultValue={a.feedback?.score ?? ''} style={{width:100}}/>
              <input id={`fb_txt_${a._id}`} className="input" placeholder="Comentario" defaultValue={a.feedback?.text ?? ''} style={{flex:1}}/>
              <button className="btn" onClick={()=>onFeedback(a._id, i)}>Enviar feedback</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
