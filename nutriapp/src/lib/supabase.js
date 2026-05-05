// src/lib/supabase.js
// Cliente de Supabase — usado en toda la app para leer y escribir datos
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠ NutriApp: Variables de entorno de Supabase no encontradas.\n" +
    "Asegurate de tener un archivo .env con:\n" +
    "  VITE_SUPABASE_URL=...\n" +
    "  VITE_SUPABASE_ANON_KEY=..."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── HELPERS DE BASE DE DATOS ────────────────────────────────────────────────

/** Obtiene todos los pacientes */
export const getPacientes = async () => {
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("fecha_ingreso", { ascending: false });
  if (error) throw error;
  return data;
};

/** Crea un paciente nuevo */
export const crearPaciente = async (paciente) => {
  const { data, error } = await supabase
    .from("pacientes")
    .insert([paciente])
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Guarda una valoración antropométrica */
export const guardarAntropometria = async (antro) => {
  const { data, error } = await supabase
    .from("antropometrias")
    .insert([antro])
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Guarda una consulta de seguimiento */
export const guardarConsulta = async (consulta) => {
  const { data, error } = await supabase
    .from("consultas_seguimiento")
    .insert([consulta])
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Obtiene todas las consultas de un paciente */
export const getConsultas = async (pacienteId) => {
  const { data, error } = await supabase
    .from("consultas_seguimiento")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("numero", { ascending: true });
  if (error) throw error;
  return data;
};

/** Busca alimentos en la base de datos */
export const buscarAlimentos = async (query) => {
  const { data, error } = await supabase
    .from("alimentos_db")
    .select("*")
    .ilike("nombre", `%${query}%`)
    .limit(10);
  if (error) throw error;
  return data;
};
