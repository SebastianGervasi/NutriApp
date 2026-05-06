import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('⚠ Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env')
}

export const supabase = createClient(url, key)

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthChange = (cb) => supabase.auth.onAuthStateChange(cb)

// ─── PERFIL ───────────────────────────────────────────────────────────────────

export const getPerfil = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertPerfil = async (perfil) => {
  const { data, error } = await supabase
    .from('perfiles')
    .upsert(perfil)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── PACIENTES ────────────────────────────────────────────────────────────────

export const getPacientes = async () => {
  const { data, error } = await supabase
    .from('pacientes')
    .select(`
      *,
      consultas_seguimiento ( numero, fecha, peso_actual ),
      antropometrias ( imc, fecha_valoracion )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getPaciente = async (id) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select(`
      *,
      anamnesis (*),
      antecedentes_clinicos (*),
      consultas_seguimiento ( * ),
      antropometrias ( * ),
      planes_alimentarios ( id, nombre, fecha, vct_objetivo )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const crearPaciente = async (paciente) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('pacientes')
    .insert({ ...paciente, profesional_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const actualizarPaciente = async (id, cambios) => {
  const { data, error } = await supabase
    .from('pacientes')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const eliminarPaciente = async (id) => {
  const { error } = await supabase.from('pacientes').delete().eq('id', id)
  if (error) throw error
}

// ─── ANAMNESIS ────────────────────────────────────────────────────────────────

export const guardarAnamnesis = async (anamnesis) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('anamnesis')
    .upsert({ ...anamnesis, profesional_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── ANTROPOMETRÍA ────────────────────────────────────────────────────────────

export const guardarAntropometria = async (antro) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('antropometrias')
    .insert({ ...antro, profesional_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getAntropometrias = async (pacienteId) => {
  const { data, error } = await supabase
    .from('antropometrias')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_valoracion', { ascending: true })
  if (error) throw error
  return data
}

// ─── CONSULTAS ────────────────────────────────────────────────────────────────

export const guardarConsulta = async (consulta) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('consultas_seguimiento')
    .insert({ ...consulta, profesional_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getConsultas = async (pacienteId) => {
  const { data, error } = await supabase
    .from('consultas_seguimiento')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('numero', { ascending: true })
  if (error) throw error
  return data
}

// ─── ALIMENTOS ────────────────────────────────────────────────────────────────

export const buscarAlimentos = async (query) => {
  const { data, error } = await supabase
    .from('alimentos_db')
    .select('*')
    .ilike('nombre', `%${query}%`)
    .limit(10)
  if (error) throw error
  return data
}

// ─── PLANES ───────────────────────────────────────────────────────────────────

export const guardarPlan = async (plan, items) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: planData, error: planError } = await supabase
    .from('planes_alimentarios')
    .insert({ ...plan, profesional_id: user.id })
    .select()
    .single()
  if (planError) throw planError

  if (items && items.length > 0) {
    const rows = items.map(i => ({
      plan_id:      planData.id,
      alimento_id:  i.alimento_id || null,
      nombre_libre: i.nombre_libre || i.alimento?.nombre || null,
      momento:      i.momento,
      gramos:       i.gramos,
    }))
    const { error: itemsError } = await supabase.from('items_plan').insert(rows)
    if (itemsError) throw itemsError
  }

  return planData
}
