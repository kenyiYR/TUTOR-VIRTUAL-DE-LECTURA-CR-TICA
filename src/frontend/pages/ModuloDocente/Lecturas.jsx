import { useEffect, useState } from 'react';
import { listMyReadings, uploadReading } from '../../services/readings.js';
import { assignReading } from '../../services/assignments.js';
import { Link } from 'react-router-dom';
import '../../styles/panel.css';

export default function LecturasDocente(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // form upload
  const [titulo,setTitulo]=useState('');
  const [descripcion,setDescripcion]=useState('');
  const [file,setFile]=useState(null);

  // asignar
  const [assignOpen, setAssignOpen] = useState(null); // readingId abierto
  const [studentIds, setStudentIds] = useState('');   // IDs separados por coma
  const [due, setDue] = useState('');

  async function load(){
    setLoading(true);
    try{ setItems(await listMyReadings()); }
    catch(e){ setMsg(e.message); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function onUpload(e){
    e.preventDefault(); setMsg('');
    if (!file) return setMsg('Selecciona un archivo');
    try{
      await uploadReading({ titulo, descripcion, file });
      setTitulo(''); setDescripcion(''); setFile(null);
      await load(); setMsg('Lectura subida ✅');
    }catch(e){ setMsg(e.message); }
  }

  async function onAssign(readingId){
    const ids = studentIds.split(',').map(s=>s.trim()).filter(Boolean);
    if (!ids.length) return setMsg('Ingresa al menos 1 ID de estudiante');
    try{
      await assignReading({ readingId, studentIds: ids, dueDate: due || undefined });
      setMsg('Asignación creada ✅');
      setAssignOpen(null); setStudentIds(''); setDue('');
    }catch(e){ setMsg(e.message); }
  }

  return (

    <div className="panel-wrap">
      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0 }}>Asignación de lecturas</h3>
      <Link className="btn" to="/docente/tablero">Ver tablero</Link>
    </div>
    
    <div className="panel-wrap">
      <div className="card" style={{maxWidth:800, margin:'0 auto 16px'}}>
        <h3>Subir nueva lectura</h3>
        <form onSubmit={onUpload} className="row">
          <input className="input" placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} required />
          <input className="input" placeholder="Descripción (opcional)" style={{flex:1}} value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
          <input className="file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>setFile(e.target.files[0])} required />
          <button className="btn" type="submit">Subir</button>
          {msg && <span style={{color:'#9ca3af'}}>{msg}</span>}
        </form>
      </div>

      <div className="panel-grid">
        {loading ? <div className="card">Cargando…</div> :
        items.length===0 ? <div className="card">Aún no subes lecturas.</div> :
        items.map(r=>(
          <div key={r._id} className="card">
            <h3>{r.titulo}</h3>
            <p>{r.descripcion || 'Sin descripción'}</p>
            <div className="row">
              <a className="link" href={r.url} target="_blank" rel="noreferrer">Ver archivo</a>
              <span className="kbd">{r._id.slice(-8)}</span>
              <button className="btn gray" onClick={()=>setAssignOpen(assignOpen===r._id?null:r._id)}>
                {assignOpen===r._id?'Cerrar asignación':'Asignar'}
              </button>
            </div>

            {assignOpen===r._id && (
              <div>
                <div className="hr" />
                <p style={{margin:'6px 0'}}>Ingresa <b>IDs de estudiantes</b> separados por coma (rápido para pruebas). Luego hacemos selector por email.</p>
                <input className="input" placeholder="64fa...a81, 64fb...c02" style={{width:'100%'}} value={studentIds} onChange={e=>setStudentIds(e.target.value)} />
                <div className="row" style={{marginTop:8}}>
                  <input className="date" type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} />
                  <button className="btn" onClick={()=>onAssign(r._id)}>Asignar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
