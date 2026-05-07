import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import ModalNuevoPaciente from './ModalNuevoPaciente'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcEdad = (fechaNac) => {
  if (!fechaNac) return null
  const hoy = new Date(), nac = new Date(fechaNac)
  let e = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) e--
  return e > 0 ? e : null
}

const ESTADO_CFG = {
  activo:   { label: 'Activo',   bg: '#E1F5EE', color: '#0F6E56' },
  nuevo:    { label: 'Nuevo',    bg: '#EEEDFE', color: '#3C3489' },
  alta:     { label: 'Alta',     bg: '#E6F1FB', color: '#0C447C' },
  pausa:    { label: 'Pausa',    bg: '#FAEEDA', color: '#633806' },
  inactivo: { label: 'Inactivo', bg: '#F1EFE8', color: '#5F5E5A' },
}

const AVATAR_COLORS = ['#1D9E75','#7F77DD','#378ADD','#D85A30','#EF9F27','#D4537E']
const avatarColor = (str = '') => AVATAR_COLORS[(str.charCodeAt(0) || 0) % AVATAR_COLORS.length]

function Avatar({ nombre = '?', apellido = '?', size = 32 }) {
  const ini = `${nombre[0] || '?'}${apellido[0] || '?'}`.toUpperCase()
  const bg  = avatarColor(nombre)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg + '22', border: `1.5px solid ${bg}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 500, color: bg,
    }}>{ini}</div>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '◈', label: 'Dashboard' },
  { id: 'nuevo',        icon: '＋', label: 'Nuevo paciente' },
  { id: 'antro',        icon: '◉', label: 'Antropometría' },
  { id: 'plan',         icon: '◐', label: 'Plan alimentario' },
  { id: 'seguimiento',  icon: '◑', label: 'Seguimiento' },
]

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard({ onVerPaciente }) {
  const { user, perfil } = useAuth()

  const [pacientes,  setPacientes]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [query,      setQuery]      = useState('')
  const [filtro,     setFiltro]     = useState('todos')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true); setError('')
    try {
      const { data, error: err } = await supabase
        .from('pacientes')
        .select(`
          id, nombre, apellido, dni, email, fecha_nacimiento, sexo,
          estado, fecha_ingreso, tipo_consulta, patron_alimentario,
          localidad, provincia,
          consultas_seguimiento ( numero ),
          antropometrias ( imc, peso, fecha_valoracion )
        `)
        .order('created_at', { ascending: false })
      if (err) throw err
      setPacientes(data || [])
    } catch (e) {
      setError('No se pudieron cargar los pacientes. Verificá la conexión a Supabase.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePacienteCreado = useCallback((nuevo) => {
    setPacientes(prev => [nuevo, ...prev])
  }, [])

  const handleEstadoCambio = useCallback(async (id, nuevoEstado, e) => {
    e.stopPropagation()
    try {
      const { error: err } = await supabase
        .from('pacientes')
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (err) throw err
      setPacientes(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }, [])

  const handleEliminar = useCallback(async (id, nombre, e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminár a ${nombre}? Esta acción no se puede deshacer y borrará todos sus datos.`)) return
    try {
      const { error: err } = await supabase.from('pacientes').delete().eq('id', id)
      if (err) throw err
      setPacientes(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Stats
  const stats = useMemo(() => ({
    total:    pacientes.length,
    activos:  pacientes.filter(p => p.estado === 'activo' || p.estado === 'nuevo').length,
    hoy:      pacientes.filter(p => new Date(p.fecha_ingreso).toDateString() === new Date().toDateString()).length,
  }), [pacientes])

  // Filtrado
  const filtrados = useMemo(() => {
    const q = query.toLowerCase().trim()
    return pacientes.filter(p => {
      const matchQ = !q ||
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
        (p.dni || '').replace(/\./g,'').includes(q.replace(/\./g,'')) ||
        (p.email || '').toLowerCase().includes(q)
      const matchF = filtro === 'todos' || p.estado === filtro
      return matchQ && matchF
    })
  }, [pacientes, query, filtro])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F4F0', fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", color: '#2C2C2A' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: collapsed ? 58 : 220, flexShrink: 0,
        background: '#FAFAF8', borderRight: '1px solid #E8E6DF',
        display: 'flex', flexDirection: 'column',
        transition: 'width .22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden', minHeight: '100vh',
      }}>
        {/* Logo */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '0' : '0 18px', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid #E8E6DF', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', flexShrink: 0 }}>✦</div>
          {!collapsed && <div><div style={{ fontSize: 14, fontWeight: 600, color: '#2C2C2A' }}>NutriApp</div><div style={{ fontSize: 10, color: '#B4B2A9' }}>Consultorio digital</div></div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {!collapsed && <div style={{ fontSize: 10, fontWeight: 500, color: '#B4B2A9', letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 18px 5px' }}>Módulos</div>}
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'nuevo' ? setModalOpen(true) : null}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '9px 18px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: item.id === 'dashboard' ? '#E1F5EE' : 'transparent',
                border: 'none',
                borderLeft: item.id === 'dashboard' ? '2.5px solid #1D9E75' : '2.5px solid transparent',
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 14, color: item.id === 'dashboard' ? '#0F6E56' : '#888780', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 12, color: item.id === 'dashboard' ? '#0F6E56' : '#5F5E5A', fontWeight: item.id === 'dashboard' ? 500 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Usuario */}
        <div style={{ padding: collapsed ? '14px 0' : '14px 18px', borderTop: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E1F5EE', border: '1.5px solid #9FE1CB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#0F6E56', flexShrink: 0 }}>
            {(user?.email || '?')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#2C2C2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : user?.email}
              </div>
              <button
                onClick={handleLogout}
                style={{ fontSize: 10, color: '#B4B2A9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >Cerrar sesión</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888780', padding: 6, borderRadius: 6 }}
          >☰</button>

          {/* Buscador */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#B4B2A9', pointerEvents: 'none' }}>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, apellido o DNI…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E8E6DF', borderRadius: 10, fontSize: 12, color: '#2C2C2A', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1D9E75'}
              onBlur={e  => e.target.style.borderColor = '#E8E6DF'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={cargar}
              style={{ background: '#fff', border: '1.5px solid #E8E6DF', borderRadius: 8, padding: '7px 12px', fontSize: 11, color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}
              title="Recargar lista"
            >↻</button>
            <button
              onClick={() => setModalOpen(true)}
              style={{ background: '#1D9E75', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
            >+ Nuevo paciente</button>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: '22px', overflowY: 'auto' }}>

          {/* Encabezado */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: '#2C2C2A', fontFamily: 'Georgia,serif', margin: 0 }}>
              {perfil?.nombre ? `Hola, ${perfil.nombre} ✦` : 'Dashboard ✦'}
            </h1>
            <p style={{ fontSize: 12, color: '#B4B2A9', marginTop: 4 }}>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
            {[
              { label: 'Total pacientes',  value: stats.total,   sub: 'registrados',        icon: '◈', accent: '#1D9E75' },
              { label: 'Activos / Nuevos', value: stats.activos, sub: 'en seguimiento',     icon: '◑', accent: '#7F77DD' },
              { label: 'Ingresados hoy',   value: stats.hoy,     sub: 'nuevos en la sesión',icon: '◐', accent: '#378ADD' },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E6DF', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</span>
                  <span style={{ fontSize: 16, color: k.accent }}>{k.icon}</span>
                </div>
                <div style={{ fontSize: 34, fontWeight: 300, color: '#2C2C2A', fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
                <span style={{ fontSize: 11, color: '#B4B2A9' }}>{k.sub}</span>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div style={{ background: '#fff', border: '1px solid #E8E6DF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>

            {/* Filtros */}
            <div style={{ padding: '13px 20px', borderBottom: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A', marginRight: 4 }}>Pacientes</span>
              {['todos','activo','nuevo','alta','pausa','inactivo'].map(f => {
                const lbl = f === 'todos' ? 'Todos' : (ESTADO_CFG[f]?.label || f)
                return (
                  <button key={f} onClick={() => setFiltro(f)} style={{
                    fontSize: 11, padding: '4px 11px', borderRadius: 20,
                    border: `1.5px solid ${filtro === f ? '#1D9E75' : '#E8E6DF'}`,
                    background: filtro === f ? '#E1F5EE' : '#fff',
                    color: filtro === f ? '#0F6E56' : '#888780',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: filtro === f ? 500 : 400,
                    transition: 'all .12s',
                  }}>{lbl}</button>
                )
              })}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#B4B2A9' }}>
                {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr .7fr .7fr .65fr .85fr 1fr 90px', padding: '9px 20px', background: '#FAFAF8', borderBottom: '1px solid #E8E6DF' }}>
              {['Paciente','Edad','IMC','Consultas','Estado','Ingreso',''].map(h => (
                <span key={h} style={{ fontSize: 9, fontWeight: 500, color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</span>
              ))}
            </div>

            {/* Filas */}
            {loading ? (
              <div style={{ padding: '52px 20px', textAlign: 'center', color: '#B4B2A9' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E1F5EE', borderTopColor: '#1D9E75', margin: '0 auto 10px', animation: 'spin .8s linear infinite' }} />
                <div style={{ fontSize: 13 }}>Cargando pacientes…</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : error ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#D85A30', marginBottom: 12 }}>⚠ {error}</div>
                <button onClick={cargar} style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reintentar</button>
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#B4B2A9' }}>
                {query ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', marginBottom: 4 }}>Sin resultados para "{query}"</div>
                    <div style={{ fontSize: 12 }}>Probá con otro nombre, apellido o DNI</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', marginBottom: 4 }}>Aún no tenés pacientes registrados</div>
                    <div style={{ fontSize: 12, marginBottom: 18 }}>Creá tu primer paciente para comenzar</div>
                    <button onClick={() => setModalOpen(true)} style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      + Agregar primer paciente
                    </button>
                  </>
                )}
              </div>
            ) : (
              filtrados.map((p, i) => {
                const ec     = ESTADO_CFG[p.estado] || ESTADO_CFG.activo
                const edad   = calcEdad(p.fecha_nacimiento)
                const antros = (p.antropometrias || []).sort((a,b) => new Date(b.fecha_valoracion)-new Date(a.fecha_valoracion))
                const imc    = antros[0]?.imc
                const cons   = (p.consultas_seguimiento || []).length
                const fecha  = new Date(p.fecha_ingreso).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'2-digit' })

                return (
                  <div
                    key={p.id}
                    onClick={() => onVerPaciente?.(p.id, p)}
                    style={{
                      display: 'grid', gridTemplateColumns: '2.2fr .7fr .7fr .65fr .85fr 1fr 90px',
                      padding: '12px 20px', borderBottom: i < filtrados.length-1 ? '1px solid #F1F0EA' : 'none',
                      alignItems: 'center', cursor: 'pointer', transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Nombre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nombre={p.nombre} apellido={p.apellido} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A' }}>{p.apellido}, {p.nombre}</div>
                        {p.email && <div style={{ fontSize: 10, color: '#B4B2A9', marginTop: 1 }}>{p.email}</div>}
                      </div>
                    </div>
                    {/* Edad */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{edad != null ? `${edad} a.` : '—'}</span>
                    {/* IMC */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{imc ? imc.toFixed(1) : '—'}</span>
                    {/* Consultas */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{cons} / 5</span>
                    {/* Estado */}
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={p.estado}
                        onChange={e => handleEstadoCambio(p.id, e.target.value, e)}
                        style={{
                          fontSize: 10, padding: '3px 7px', borderRadius: 8,
                          border: `1px solid ${ec.color}44`, background: ec.bg,
                          color: ec.color, fontWeight: 500, cursor: 'pointer',
                          outline: 'none', fontFamily: 'inherit',
                        }}
                      >
                        {Object.entries(ESTADO_CFG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Fecha */}
                    <span style={{ fontSize: 11, color: '#B4B2A9' }}>{fecha}</span>
                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onVerPaciente?.(p.id, p)}
                        title="Ver historia clínica"
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #E8E6DF', background: '#fff', color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}
                      >HC</button>
                      <button
                        onClick={e => handleEliminar(p.id, `${p.nombre} ${p.apellido}`, e)}
                        title="Eliminar"
                        style={{ fontSize: 11, padding: '4px 7px', borderRadius: 6, border: '1.5px solid #FAECE7', background: '#FAECE7', color: '#D85A30', cursor: 'pointer', fontFamily: 'inherit' }}
                      >✕</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal — renderizado fuera del árbol del dashboard para evitar re-renders */}
      {modalOpen && (
        <ModalNuevoPaciente
          onClose={() => setModalOpen(false)}
          onCreado={handlePacienteCreado}
        />
      )}
    </div>
  )
}
