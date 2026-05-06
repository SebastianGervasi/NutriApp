import { useAuth } from './context/AuthContext'
import Login     from './modules/Auth/Login'
import Dashboard from './modules/Dashboard/Dashboard'

export default function App() {
  const { user, loading } = useAuth()

  // Pantalla de carga inicial mientras Supabase verifica la sesión
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #F5F4F0 0%, #E1F5EE 100%)',
        fontFamily: "'DM Sans', sans-serif", color: '#2C2C2A',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: '#fff', marginBottom: 16,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>✦</div>
        <div style={{ fontSize: 14, color: '#888780' }}>Cargando NutriApp…</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    )
  }

  // Sin sesión → pantalla de login
  if (!user) return <Login />

  // Con sesión → dashboard
  // TODO: agregar enrutador completo (seguimiento, antropometría, plan) en próxima iteración
  return (
    <Dashboard
      onVerPaciente={(id, paciente) => {
        // Por ahora muestra un alert — próxima iteración conecta los módulos
        alert(`Historia clínica de ${paciente.nombre} ${paciente.apellido} — próximamente disponible`)
      }}
    />
  )
}
