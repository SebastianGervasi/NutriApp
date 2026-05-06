import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const S = {
  page: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #F5F4F0 0%, #E1F5EE 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", padding: '20px',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '44px 40px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(29,158,117,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32,
  },
  logoIcon: {
    width: 44, height: 44, borderRadius: 13,
    background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: '#fff',
  },
  logoText: { fontSize: 20, fontWeight: 600, color: '#2C2C2A', letterSpacing: '-0.02em' },
  logoSub:  { fontSize: 11, color: '#B4B2A9', marginTop: 1 },
  title:    { fontSize: 22, fontWeight: 300, color: '#2C2C2A', marginBottom: 6, fontFamily: 'Georgia, serif' },
  subtitle: { fontSize: 13, color: '#888780', marginBottom: 28 },
  label:    { fontSize: 11, fontWeight: 500, color: '#5F5E5A', display: 'block', marginBottom: 5 },
  input: {
    width: '100%', padding: '11px 14px', border: '1.5px solid #E8E6DF',
    borderRadius: 10, fontSize: 14, color: '#2C2C2A', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box',
  },
  fieldWrap: { marginBottom: 16 },
  btn: {
    width: '100%', padding: '13px', background: '#1D9E75', color: '#fff',
    border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
    transition: 'background 0.15s',
  },
  btnDisabled: { background: '#B4B2A9', cursor: 'not-allowed' },
  error: {
    background: '#FAECE7', border: '1px solid #F5C4B0', borderRadius: 10,
    padding: '10px 14px', fontSize: 12, color: '#712B13', marginBottom: 16,
  },
  success: {
    background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 10,
    padding: '10px 14px', fontSize: 12, color: '#0F6E56', marginBottom: 16,
  },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888780' },
  toggleLink: { color: '#1D9E75', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' },
  divider: { height: 1, background: '#F1F0EA', margin: '24px 0' },
}

export default function Login() {
  const [modo,     setModo]     = useState('login')   // 'login' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [mensaje,  setMensaje]  = useState('')

  const [focusedField, setFocusedField] = useState(null)

  const inputStyle = (field) => ({
    ...S.input,
    borderColor: focusedField === field ? '#1D9E75' : '#E8E6DF',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    if (!email || !password) { setError('Completá email y contraseña.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }

    setLoading(true)
    try {
      if (modo === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        // AuthProvider detecta el cambio y redirige automáticamente
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setMensaje('¡Cuenta creada! Revisá tu email para confirmar la dirección y luego iniciá sesión.')
        setModo('login')
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials':           'Email o contraseña incorrectos.',
        'Email not confirmed':                  'Confirmá tu email antes de iniciar sesión.',
        'User already registered':             'Este email ya tiene una cuenta. Iniciá sesión.',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      }
      setError(msgs[err.message] || `Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>✦</div>
          <div>
            <div style={S.logoText}>NutriApp</div>
            <div style={S.logoSub}>Consultorio digital</div>
          </div>
        </div>

        {/* Título */}
        <div style={S.title}>{modo === 'login' ? 'Bienvenida' : 'Crear cuenta'}</div>
        <div style={S.subtitle}>
          {modo === 'login'
            ? 'Ingresá con tus credenciales para acceder a tu consultorio.'
            : 'Creá tu cuenta para empezar a gestionar tus pacientes.'}
        </div>

        {/* Mensajes */}
        {error   && <div style={S.error}>⚠ {error}</div>}
        {mensaje && <div style={S.success}>✓ {mensaje}</div>}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={S.fieldWrap}>
            <label style={S.label}>Email profesional</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="lic.russo@ejemplo.com"
              style={inputStyle('email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoComplete="email"
            />
          </div>
          <div style={S.fieldWrap}>
            <label style={S.label}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle('password')}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            onMouseEnter={e => !loading && (e.target.style.background = '#0F6E56')}
            onMouseLeave={e => !loading && (e.target.style.background = '#1D9E75')}
          >
            {loading
              ? (modo === 'login' ? 'Ingresando…' : 'Creando cuenta…')
              : (modo === 'login' ? 'Ingresar al consultorio' : 'Crear cuenta')}
          </button>
        </form>

        <div style={S.divider} />

        {/* Toggle */}
        <div style={S.toggle}>
          {modo === 'login' ? (
            <>¿Primera vez? <span style={S.toggleLink} onClick={() => { setModo('signup'); setError(''); setMensaje('') }}>Creá tu cuenta gratis</span></>
          ) : (
            <>¿Ya tenés cuenta? <span style={S.toggleLink} onClick={() => { setModo('login'); setError(''); setMensaje('') }}>Iniciá sesión</span></>
          )}
        </div>

        {/* Info seguridad */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: '#D3D1C7' }}>
          🔒 Tus datos y los de tus pacientes son privados y seguros
        </div>
      </div>
    </div>
  )
}
