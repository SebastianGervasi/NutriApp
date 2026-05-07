import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const INITIAL_FORM = {
  nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
  sexo: '', email: '', telefono: '', provincia: '',
  localidad: '', tipo_consulta: 'Presencial',
  patron_alimentario: 'Omnívoro', estado: 'nuevo',
}

// Componentes definidos FUERA del componente principal para evitar re-renders
function Field({ label, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#5F5E5A' }}>
        {label}{required && <span style={{ color: '#D85A30', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  padding: '9px 12px', border: '1.5px solid #E8E6DF', borderRadius: 9,
  fontSize: 13, color: '#2C2C2A', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box', transition: 'border-color .15s',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none', background: '#fff', cursor: 'pointer',
}

export default function ModalNuevoPaciente({ onClose, onCreado }) {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // useCallback para que la función no se recree y evitar focus loss
  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const handleFocus = useCallback((e) => {
    e.target.style.borderColor = '#1D9E75'
  }, [])

  const handleBlur = useCallback((e) => {
    e.target.style.borderColor = '#E8E6DF'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) throw new Error('No hay sesión activa. Recargá la página.')

      const payload = {
        profesional_id:    user.id,
        nombre:            form.nombre.trim(),
        apellido:          form.apellido.trim(),
        dni:               form.dni.trim()               || null,
        fecha_nacimiento:  form.fecha_nacimiento         || null,
        sexo:              form.sexo                     || null,
        email:             form.email.trim()             || null,
        telefono:          form.telefono.trim()          || null,
        provincia:         form.provincia.trim()         || null,
        localidad:         form.localidad.trim()         || null,
        tipo_consulta:     form.tipo_consulta            || null,
        patron_alimentario:form.patron_alimentario       || null,
        estado:            form.estado,
      }

      const { data, error: insertErr } = await supabase
        .from('pacientes')
        .insert(payload)
        .select()
        .single()

      if (insertErr) throw insertErr

      onCreado(data)
      onClose()
    } catch (err) {
      console.error('Error al crear paciente:', err)
      setError(err.message || 'Error desconocido al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(44,44,42,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, backdropFilter: 'blur(3px)', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px 36px',
        width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#2C2C2A' }}>Nuevo paciente</div>
            <div style={{ fontSize: 12, color: '#B4B2A9', marginTop: 2 }}>
              Podés completar la historia clínica y antropometría después
            </div>
          </div>
          <button
            type="button" onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#B4B2A9', lineHeight: 1, padding: '0 4px' }}
          >×</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FAECE7', border: '1px solid #F5C4B0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#712B13', marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            <Field label="Nombre" required>
              <input
                type="text" value={form.nombre} onChange={handleChange('nombre')}
                placeholder="María" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
                autoComplete="off"
              />
            </Field>

            <Field label="Apellido" required>
              <input
                type="text" value={form.apellido} onChange={handleChange('apellido')}
                placeholder="García" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
                autoComplete="off"
              />
            </Field>

            <Field label="DNI">
              <input
                type="text" value={form.dni} onChange={handleChange('dni')}
                placeholder="XX.XXX.XXX" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </Field>

            <Field label="Fecha de nacimiento">
              <input
                type="date" value={form.fecha_nacimiento} onChange={handleChange('fecha_nacimiento')}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </Field>

            <Field label="Sexo biológico">
              <select value={form.sexo} onChange={handleChange('sexo')} style={selectStyle}>
                <option value="">Seleccionar…</option>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>Otro</option>
              </select>
            </Field>

            <Field label="Tipo de consulta">
              <select value={form.tipo_consulta} onChange={handleChange('tipo_consulta')} style={selectStyle}>
                <option>Presencial</option>
                <option>Online</option>
                <option>Mixta</option>
              </select>
            </Field>

            <Field label="Email">
              <input
                type="email" value={form.email} onChange={handleChange('email')}
                placeholder="mail@ejemplo.com" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
                autoComplete="off"
              />
            </Field>

            <Field label="Teléfono / WhatsApp">
              <input
                type="tel" value={form.telefono} onChange={handleChange('telefono')}
                placeholder="+54 11 XXXX-XXXX" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </Field>

            <Field label="Provincia">
              <input
                type="text" value={form.provincia} onChange={handleChange('provincia')}
                placeholder="Buenos Aires" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </Field>

            <Field label="Localidad">
              <input
                type="text" value={form.localidad} onChange={handleChange('localidad')}
                placeholder="Capital Federal" style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </Field>

            <Field label="Patrón alimentario">
              <select value={form.patron_alimentario} onChange={handleChange('patron_alimentario')} style={selectStyle}>
                <option>Omnívoro</option>
                <option>Ovolactovegetariano</option>
                <option>Vegetariano</option>
                <option>Vegano</option>
                <option>Otro</option>
              </select>
            </Field>

            <Field label="Estado inicial">
              <select value={form.estado} onChange={handleChange('estado')} style={selectStyle}>
                <option value="nuevo">Nuevo</option>
                <option value="activo">Activo</option>
              </select>
            </Field>

          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', border: '1.5px solid #E8E6DF', borderRadius: 10, background: '#fff', fontSize: 13, color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1.5, padding: '11px', border: 'none', borderRadius: 10,
                background: loading ? '#B4B2A9' : '#1D9E75',
                color: '#fff', fontSize: 13, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  Guardando…
                </>
              ) : 'Crear paciente'}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
