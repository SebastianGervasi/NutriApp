import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase, getPacientes, crearPaciente, actualizarPaciente, eliminarPaciente } from '../../lib/supabase'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcEdad = (fechaNac) => {
  if (!fechaNac) return null
  const hoy = new Date(), nac = new Date(fechaNac)
  let e = hoy.getFullYear() - nac.getFullYear()
  if (hoy.getMonth() - nac.getMonth() < 0 ||
     (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--
  return e > 0 ? e : null
}

const calcIMC = (peso, talla) =>
  peso && talla ? (peso / ((talla / 100) ** 2)).toFixed(1) : null

const iniciales = (nombre, apellido) =>
  `${(nombre || '?')[0]}${(apellido || '?')[0]}`.toUpperCase()

const ESTADO_CFG = {
  activo:   { label: 'Activo',    bg: '#E1F5EE', color: '#0F6E56' },
  nuevo:    { label: 'Nuevo',     bg: '#EEEDFE', color: '#3C3489' },
  alta:     { label: 'Alta',      bg: '#E6F1FB', color: '#0C447C' },
  pausa:    { label: 'Pausa',     bg: '#FAEEDA', color: '#633806' },
  inactivo: { label: 'Inactivo',  bg: '#F1EFE8', color: '#5F5E5A' },
}

const AVATAR_COLORS = ['#1D9E75','#7F77DD','#378ADD','#D85A30','#EF9F27','#D4537E']
const avatarColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

// ─── COMPONENTES UI ───────────────────────────────────────────────────────────
const Pill = ({ label, bg, color }) => (
  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: bg, color, fontWeight: 500, whiteSpace: 'nowrap' }}>
    {label}
  </span>
)

const Avatar = ({ nombre, apellido, size = 36 }) => {
  const ini = iniciales(nombre, apellido)
  const bg  = avatarColor(nombre)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg + '22', border: `1.5px solid ${bg}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.31, fontWeight: 500, color: bg, flexShrink: 0,
    }}>{ini}</div>
  )
}

// ─── MODAL NUEVO PACIENTE ─────────────────────────────────────────────────────
function ModalNuevoPaciente({ onClose, onCreado }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
    sexo: '', email: '', telefono: '', provincia: '',
    localidad: '', tipo_consulta: 'Presencial', patron_alimentario: 'Omnívoro',
    estado: 'nuevo',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const nuevo = await crearPaciente(form)
      onCreado(nuevo)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear el paciente.')
    } finally {
      setLoading(false)
    }
  }

  const Input = ({ label, field, type = 'text', placeholder = '' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#5F5E5A' }}>{label}</label>
      <input
        type={type} value={form[field]} placeholder={placeholder}
        onChange={e => set(field, e.target.value)}
        style={{
          padding: '9px 12px', border: '1.5px solid #E8E6DF', borderRadius: 9,
          fontSize: 13, color: '#2C2C2A', outline: 'none', fontFamily: 'inherit',
          width: '100%', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#1D9E75'}
        onBlur={e  => e.target.style.borderColor = '#E8E6DF'}
      />
    </div>
  )

  const Select = ({ label, field, options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#5F5E5A' }}>{label}</label>
      <select
        value={form[field]} onChange={e => set(field, e.target.value)}
        style={{
          padding: '9px 12px', border: '1.5px solid #E8E6DF', borderRadius: 9,
          fontSize: 13, color: '#2C2C2A', background: '#fff', outline: 'none',
          fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', cursor: 'pointer',
        }}
        onFocus={e => e.target.style.borderColor = '#1D9E75'}
        onBlur={e  => e.target.style.borderColor = '#E8E6DF'}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,44,42,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#2C2C2A' }}>Nuevo paciente</div>
            <div style={{ fontSize: 12, color: '#B4B2A9', marginTop: 2 }}>Datos básicos — podés completar la historia clínica después</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#B4B2A9', lineHeight: 1 }}>×</button>
        </div>

        {error && <div style={{ background: '#FAECE7', border: '1px solid #F5C4B0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#712B13', marginBottom: 16 }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Nombre *" field="nombre" placeholder="María" />
            <Input label="Apellido *" field="apellido" placeholder="García" />
            <Input label="DNI" field="dni" placeholder="XX.XXX.XXX" />
            <Input label="Fecha de nacimiento" field="fecha_nacimiento" type="date" />
            <Select label="Sexo biológico" field="sexo" options={['', 'Femenino', 'Masculino', 'Otro']} />
            <Select label="Tipo de consulta" field="tipo_consulta" options={['Presencial', 'Online', 'Mixta']} />
            <Input label="Email" field="email" type="email" placeholder="mail@ejemplo.com" />
            <Input label="Teléfono / WhatsApp" field="telefono" placeholder="+54 11 XXXX-XXXX" />
            <Input label="Provincia" field="provincia" placeholder="Buenos Aires" />
            <Input label="Localidad" field="localidad" placeholder="Capital Federal" />
            <Select label="Patrón alimentario" field="patron_alimentario" options={['Omnívoro', 'Ovolactovegetariano', 'Vegetariano', 'Vegano', 'Otro']} />
            <Select label="Estado" field="estado" options={['nuevo', 'activo', 'pausa', 'alta', 'inactivo']} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #E8E6DF', borderRadius: 10, background: '#fff', fontSize: 13, color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1.5, padding: '11px', border: 'none', borderRadius: 10, background: loading ? '#B4B2A9' : '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Guardando…' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function Dashboard({ onVerPaciente, onNuevoPacienteCompleto }) {
  const { user, perfil, setPerfil } = useAuth()
  const [pacientes,  setPacientes]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [query,      setQuery]      = useState('')
  const [filtro,     setFiltro]     = useState('todos')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [sidebarCol, setSidebarCol] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => { cargarPacientes() }, [])

  const cargarPacientes = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPacientes()
      setPacientes(data || [])
    } catch (err) {
      setError('No se pudieron cargar los pacientes. Verificá la conexión.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleEstadoCambio = async (id, nuevoEstado) => {
    try {
      await actualizarPaciente(id, { estado: nuevoEstado })
      setPacientes(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que querés eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarPaciente(id)
      setPacientes(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  // Estadísticas
  const stats = useMemo(() => {
    const activos   = pacientes.filter(p => p.estado === 'activo' || p.estado === 'nuevo').length
    const hoy       = new Date().toDateString()
    const ingresadosHoy = pacientes.filter(p => new Date(p.created_at).toDateString() === hoy).length
    return { total: pacientes.length, activos, ingresadosHoy }
  }, [pacientes])

  // Filtrado
  const filtrados = useMemo(() => {
    const q = query.toLowerCase()
    return pacientes.filter(p => {
      const matchQ = !q ||
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
        (p.dni || '').includes(q) ||
        (p.email || '').toLowerCase().includes(q)
      const matchF = filtro === 'todos' || p.estado === filtro
      return matchQ && matchF
    })
  }, [pacientes, query, filtro])

  const NAV = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { id: 'ingreso',   icon: '◎', label: 'Nuevo ingreso' },
    { id: 'antro',     icon: '◉', label: 'Antropometría' },
    { id: 'plan',      icon: '◐', label: 'Plan Alimentario' },
    { id: 'seguim',    icon: '◑', label: 'Seguimiento' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F4F0', fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", color: '#2C2C2A' }}>

      {/* ─── SIDEBAR ─── */}
      <aside style={{ width: sidebarCol ? 58 : 220, flexShrink: 0, background: '#FAFAF8', borderRight: '1px solid #E8E6DF', display: 'flex', flexDirection: 'column', transition: 'width .22s cubic-bezier(.4,0,.2,1)', overflow: 'hidden', minHeight: '100vh' }}>
        {/* Logo */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: sidebarCol ? '0' : '0 18px', justifyContent: sidebarCol ? 'center' : 'flex-start', borderBottom: '1px solid #E8E6DF', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', flexShrink: 0 }}>✦</div>
          {!sidebarCol && <div><div style={{ fontSize: 14, fontWeight: 600, color: '#2C2C2A' }}>NutriApp</div><div style={{ fontSize: 10, color: '#B4B2A9' }}>Consultorio digital</div></div>}
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {!sidebarCol && <div style={{ fontSize: 10, fontWeight: 500, color: '#B4B2A9', letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 18px 6px' }}>Módulos</div>}
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => item.id === 'ingreso' ? setModalOpen(true) : null}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarCol ? '10px 0' : '9px 18px',
                justifyContent: sidebarCol ? 'center' : 'flex-start',
                background: item.id === 'dashboard' ? '#E1F5EE' : 'transparent',
                border: 'none', cursor: 'pointer', width: '100%',
                borderLeft: item.id === 'dashboard' ? '2.5px solid #1D9E75' : '2.5px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 14, color: item.id === 'dashboard' ? '#0F6E56' : '#888780', flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCol && <span style={{ fontSize: 12, color: item.id === 'dashboard' ? '#0F6E56' : '#5F5E5A', fontWeight: item.id === 'dashboard' ? 500 : 400 }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {/* Footer usuario */}
        <div style={{ padding: sidebarCol ? '14px 0' : '14px 18px', borderTop: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E1F5EE', border: '1.5px solid #9FE1CB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#0F6E56', flexShrink: 0 }}>
            {(user?.email || '?')[0].toUpperCase()}
          </div>
          {!sidebarCol && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}` : user?.email}
              </div>
              <button onClick={handleLogout} style={{ fontSize: 10, color: '#B4B2A9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarCol(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888780', padding: 6, borderRadius: 6 }}>☰</button>
          {/* Buscador */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#B4B2A9' }}>⌕</span>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar paciente por nombre, DNI…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E8E6DF', borderRadius: 10, fontSize: 12, color: '#2C2C2A', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1D9E75'}
              onBlur={e  => e.target.style.borderColor = '#E8E6DF'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button onClick={cargarPacientes} style={{ background: '#fff', border: '1.5px solid #E8E6DF', borderRadius: 8, padding: '7px 12px', fontSize: 11, color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}>↻ Actualizar</button>
            <button onClick={() => setModalOpen(true)} style={{ background: '#1D9E75', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 11, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nuevo paciente</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: '#2C2C2A', fontFamily: 'Georgia,serif', margin: 0 }}>
              {perfil?.nombre ? `Hola, ${perfil.nombre} ✦` : 'Dashboard ✦'}
            </h1>
            <p style={{ fontSize: 12, color: '#B4B2A9', marginTop: 4 }}>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total pacientes',   value: stats.total,        sub: 'registrados',         accent: '#1D9E75', icon: '◈' },
              { label: 'Activos / Nuevos',  value: stats.activos,      sub: 'en seguimiento',      accent: '#7F77DD', icon: '◎' },
              { label: 'Ingresados hoy',    value: stats.ingresadosHoy,sub: 'nuevos esta sesión',  accent: '#378ADD', icon: '◐' },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E6DF', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</span>
                  <span style={{ fontSize: 15 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize: 34, fontWeight: 300, color: '#2C2C2A', fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
                <span style={{ fontSize: 11, color: '#B4B2A9' }}>{k.sub}</span>
              </div>
            ))}
          </div>

          {/* Tabla de pacientes */}
          <div style={{ background: '#fff', border: '1px solid #E8E6DF', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
            {/* Filtros */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8E6DF', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A' }}>Todos los pacientes</span>
              <div style={{ display: 'flex', gap: 6, marginLeft: 8, flexWrap: 'wrap' }}>
                {['todos','activo','nuevo','alta','pausa','inactivo'].map(f => {
                  const cfg = f === 'todos' ? { label: 'Todos' } : { label: ESTADO_CFG[f]?.label || f }
                  return (
                    <button key={f} onClick={() => setFiltro(f)} style={{
                      fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1.5px solid',
                      borderColor: filtro === f ? '#1D9E75' : '#E8E6DF',
                      background: filtro === f ? '#E1F5EE' : '#fff',
                      color: filtro === f ? '#0F6E56' : '#888780',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: filtro === f ? 500 : 400,
                    }}>{cfg.label}</button>
                  )
                })}
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#B4B2A9' }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Encabezado */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr .7fr .8fr .6fr .8fr 1fr 100px', padding: '10px 20px', background: '#FAFAF8', borderBottom: '1px solid #E8E6DF' }}>
              {['Paciente','Edad','IMC','Consultas','Estado','Ingreso',''].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 500, color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</span>
              ))}
            </div>

            {/* Filas */}
            {loading ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#B4B2A9' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
                <div style={{ fontSize: 13 }}>Cargando pacientes…</div>
              </div>
            ) : error ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#D85A30', marginBottom: 12 }}>⚠ {error}</div>
                <button onClick={cargarPacientes} style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reintentar</button>
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{ padding: '56px 20px', textAlign: 'center', color: '#B4B2A9' }}>
                {query ? (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>◎</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', marginBottom: 4 }}>Sin resultados para "{query}"</div>
                    <div style={{ fontSize: 12 }}>Probá con otro nombre o DNI</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', marginBottom: 4 }}>Todavía no tenés pacientes</div>
                    <div style={{ fontSize: 12, marginBottom: 16 }}>Creá tu primer paciente para empezar</div>
                    <button onClick={() => setModalOpen(true)} style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>+ Agregar primer paciente</button>
                  </div>
                )}
              </div>
            ) : (
              filtrados.map((p, i) => {
                const ec  = ESTADO_CFG[p.estado] || ESTADO_CFG['activo']
                const edad = calcEdad(p.fecha_nacimiento)
                // Última antropometría para IMC
                const antros = (p.antropometrias || []).sort((a, b) => new Date(b.fecha_valoracion) - new Date(a.fecha_valoracion))
                const imc = antros[0]?.imc
                const consultas = (p.consultas_seguimiento || []).length
                const fechaIngreso = new Date(p.fecha_ingreso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

                return (
                  <div key={p.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr .7fr .8fr .6fr .8fr 1fr 100px', padding: '13px 20px', borderBottom: i < filtrados.length - 1 ? '1px solid #F1F0EA' : 'none', alignItems: 'center', transition: 'background .1s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => onVerPaciente && onVerPaciente(p.id, p)}
                  >
                    {/* Nombre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nombre={p.nombre} apellido={p.apellido} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2C2A' }}>{p.apellido}, {p.nombre}</div>
                        {p.email && <div style={{ fontSize: 10, color: '#B4B2A9' }}>{p.email}</div>}
                      </div>
                    </div>
                    {/* Edad */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{edad ? `${edad} a.` : '—'}</span>
                    {/* IMC */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{imc ? imc.toFixed(1) : '—'}</span>
                    {/* Consultas */}
                    <span style={{ fontSize: 12, color: '#5F5E5A' }}>{consultas} / 5</span>
                    {/* Estado */}
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={p.estado}
                        onChange={e => handleEstadoCambio(p.id, e.target.value)}
                        style={{ fontSize: 10, padding: '3px 6px', borderRadius: 8, border: `1px solid ${ec.color}44`, background: ec.bg, color: ec.color, fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                      >
                        {Object.entries(ESTADO_CFG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Fecha */}
                    <span style={{ fontSize: 11, color: '#B4B2A9' }}>{fechaIngreso}</span>
                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => onVerPaciente && onVerPaciente(p.id, p)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #E8E6DF', background: '#fff', color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Ver historia clínica">HC</button>
                      <button onClick={() => handleEliminar(p.id, `${p.nombre} ${p.apellido}`)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #FAECE7', background: '#FAECE7', color: '#D85A30', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Eliminar paciente">✕</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <ModalNuevoPaciente
          onClose={() => setModalOpen(false)}
          onCreado={(nuevo) => setPacientes(prev => [nuevo, ...prev])}
        />
      )}
    </div>
  )
}
