import { useEffect, useState } from 'react';
import { getMyTeacherProfile, updateMyTeacherProfile } from '../../services/teacher.js';
import '../../../index.css'; 

const ALL_DAYS = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'];

export default function Docente() {
  const [form, setForm] = useState({
    especialidad:'', bio:'', cursos:[], redes:{ linkedin:'', github:'' },
    disponibilidad:{ dias:[], horario:'' }, avatarUrl:''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyTeacherProfile();
        setForm({
          especialidad: p.especialidad || '',
          bio: p.bio || '',
          cursos: p.cursos || [],
          redes: { linkedin: p.redes?.linkedin || '', github: p.redes?.github || '' },
          disponibilidad: { dias: p.disponibilidad?.dias || [], horario: p.disponibilidad?.horario || '' },
          avatarUrl: p.avatarUrl || ''
        });
      } catch(e){ setMsg(e.message); }
      finally{ setLoading(false); }
    })();
  }, []);

  function setField(path, value){
    setForm(prev => {
      const next = structuredClone(prev);
      const parts = path.split('.');
      let ref = next;
      for (let i=0;i<parts.length-1;i++) ref = ref[parts[i]];
      ref[parts.at(-1)] = value;
      return next;
    });
  }

  function toggleDay(d){
    const current = new Set(form.disponibilidad.dias);
    current.has(d) ? current.delete(d) : current.add(d);
    setField('disponibilidad.dias', Array.from(current));
  }

  async function onSubmit(e){
    e.preventDefault();
    setMsg(''); setSaving(true);
    try{
      const payload = {
        ...form,
        cursos: (Array.isArray(form.cursos) ? form.cursos : String(form.cursos).split(',').map(s=>s.trim()).filter(Boolean))
      };
      await updateMyTeacherProfile(payload);
      setMsg('Perfil guardado ✅');
    }catch(e){ setMsg(e.message); }
    finally{ setSaving(false); }
  }

  if (loading) return <div className="auth-wrap"><div className="auth-card">Cargando…</div></div>;

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{maxWidth: 760}}>
        <h1 className="auth-title">Perfil Docente</h1>
        <p className="auth-sub">Completa tu información para los módulos de lectura crítica.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>Especialidad</label>
          <input className="auth-input" value={form.especialidad}
                 onChange={e=>setField('especialidad', e.target.value)} />

          <label>Biografía</label>
          <textarea className="auth-input" rows={4} value={form.bio}
                    onChange={e=>setField('bio', e.target.value)} />

          <label>Cursos (separados por coma)</label>
          <input className="auth-input"
                 value={Array.isArray(form.cursos)? form.cursos.join(', ') : form.cursos}
                 onChange={e=>setField('cursos', e.target.value)} />

          <div className="auth-row" style={{gap:16}}>
            <div style={{flex:1}}>
              <label>LinkedIn</label>
              <input className="auth-input" value={form.redes.linkedin}
                     onChange={e=>setField('redes.linkedin', e.target.value)} />
            </div>
            <div style={{flex:1}}>
              <label>GitHub</label>
              <input className="auth-input" value={form.redes.github}
                     onChange={e=>setField('redes.github', e.target.value)} />
            </div>
          </div>

          <div className="auth-row" style={{gap:16}}>
            <div style={{flex:1}}>
              <label>Días disponibles</label>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {ALL_DAYS.map(d => (
                  <label key={d} style={{
                    border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px',
                    background: form.disponibilidad.dias.includes(d) ? 'rgba(96,165,250,.2)' : '#0b1220',
                    cursor:'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={form.disponibilidad.dias.includes(d)}
                      onChange={()=>toggleDay(d)}
                      style={{marginRight:8}}
                    />{d}
                  </label>
                ))}
              </div>
            </div>
            <div style={{flex:1}}>
              <label>Horario</label>
              <input className="auth-input" placeholder="09:00-13:00"
                     value={form.disponibilidad.horario}
                     onChange={e=>setField('disponibilidad.horario', e.target.value)} />
            </div>
          </div>

          <label>Foto (URL)</label>
          <input className="auth-input" value={form.avatarUrl}
                 onChange={e=>setField('avatarUrl', e.target.value)} />

          <div className="auth-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {msg && <span style={{color: msg.includes('✅') ? 'var(--ok)' : '#fecaca'}}>{msg}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
