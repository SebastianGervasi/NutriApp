-- ═══════════════════════════════════════════════════════════════════════════
-- NutriApp — Script SQL para crear todas las tablas en Supabase
-- 
-- INSTRUCCIONES:
--   1. Entrá a tu proyecto en supabase.com
--   2. Hacé clic en "SQL Editor" en el menú izquierdo
--   3. Pegá TODO el contenido de este archivo
--   4. Hacé clic en "Run" (botón verde)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── TABLA PRINCIPAL DE PACIENTES ────────────────────────────────────────────
create table if not exists pacientes (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  apellido            text not null,
  dni                 text unique,
  fecha_nacimiento    date,
  sexo                text,
  email               text,
  telefono            text,
  provincia           text,
  localidad           text,
  tipo_consulta       text,
  patron_alimentario  text,
  estado              text default 'activo',
  fecha_ingreso       timestamp with time zone default now(),
  created_at          timestamp with time zone default now()
);

-- ─── ANAMNESIS ────────────────────────────────────────────────────────────────
create table if not exists anamnesis (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid references pacientes(id) on delete cascade,
  primera_vez         text,
  motivo_consulta     text,
  ocupacion           text,
  vive_solo           text,
  sale_comer_afuera   boolean default false,
  frec_salidas        text,
  alergias            text,
  medicacion          text,
  laboratorio         text,
  autopercepcion      text,
  asistencia_psi      boolean default false,
  frec_psi            text,
  created_at          timestamp with time zone default now()
);

-- ─── ANTECEDENTES CLÍNICOS ────────────────────────────────────────────────────
create table if not exists antecedentes_clinicos (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade,
  enfermedad  text not null,
  personal    boolean default false,
  familiar    boolean default false,
  medicacion  text
);

-- ─── ANTROPOMETRÍA ────────────────────────────────────────────────────────────
create table if not exists antropometrias (
  id                uuid primary key default gen_random_uuid(),
  paciente_id       uuid references pacientes(id) on delete cascade,
  fecha_valoracion  timestamp with time zone default now(),
  -- Medidas básicas
  peso              float,
  talla             float,
  talla_sentado     float,
  envergadura       float,
  -- Pliegues cutáneos (mm)
  pl_triceps        float,
  pl_subescapular   float,
  pl_biceps         float,
  pl_cresta_iliaca  float,
  pl_supraespinal   float,
  pl_abdominal      float,
  pl_muslo          float,
  pl_pierna         float,
  -- Perímetros (cm)
  pr_brazo_rel      float,
  pr_brazo_flex     float,
  pr_cintura        float,
  pr_cadera         float,
  pr_antebrazo      float,
  pr_torax          float,
  pr_muslo          float,
  pr_pierna         float,
  -- Diámetros óseos (cm)
  d_humeral         float,
  d_biestiloideo    float,
  d_femur           float,
  d_biacromial      float,
  -- Calculados y guardados (Ross & Kerr + Heath-Carter)
  imc               float,
  pct_grasa         float,
  masa_muscular     float,
  masa_osea         float,
  masa_residual     float,
  masa_piel         float,
  soma_endo         float,
  soma_meso         float,
  soma_ecto         float,
  indice_mo         float,
  indice_gm         float
);

-- ─── REQUERIMIENTO CALÓRICO ────────────────────────────────────────────────────
create table if not exists requerimientos_caloricos (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid references pacientes(id) on delete cascade,
  peso_actual         float,
  peso_ideal          float,
  peso_objetivo       float,
  factor_actividad    float,
  tmb_harris          float,
  tmb_mifflin         float,
  vct_seleccionado    float,
  porc_hc             float,
  porc_proteinas      float,
  porc_grasas         float,
  gr_hc               float,
  gr_proteinas        float,
  gr_grasas           float,
  created_at          timestamp with time zone default now()
);

-- ─── BASE DE ALIMENTOS ────────────────────────────────────────────────────────
create table if not exists alimentos_db (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  categoria text,
  kcal      float default 0,
  hc_g      float default 0,
  prot_g    float default 0,
  gras_g    float default 0,
  ca_mg     float default 0,
  fe_mg     float default 0,
  zn_mg     float default 0,
  b12_ug    float default 0,
  vitd_ug   float default 0,
  fuente    text default 'Manual'
);

-- ─── PLANES ALIMENTARIOS ─────────────────────────────────────────────────────
create table if not exists planes_alimentarios (
  id            uuid primary key default gen_random_uuid(),
  paciente_id   uuid references pacientes(id) on delete cascade,
  nombre        text,
  fecha         timestamp with time zone default now(),
  vct_objetivo  float,
  observaciones text
);

-- ─── ITEMS DEL PLAN ───────────────────────────────────────────────────────────
create table if not exists items_plan (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid references planes_alimentarios(id) on delete cascade,
  alimento_id  uuid references alimentos_db(id),
  momento      text,
  gramos       float
);

-- ─── CONSULTAS DE SEGUIMIENTO ─────────────────────────────────────────────────
create table if not exists consultas_seguimiento (
  id               uuid primary key default gen_random_uuid(),
  paciente_id      uuid references pacientes(id) on delete cascade,
  numero           int,
  fecha            timestamp with time zone default now(),
  peso_actual      float,
  motivacion       text,
  picoteo          text,
  organizacion     text,
  bebidas          text,
  sintomas_gi      text,
  actividad_fisica text,
  recordatorio     text,
  objetivos        text,
  plan             text
);

-- ─── REGISTRO ALIMENTARIO DIARIO ─────────────────────────────────────────────
create table if not exists registros_alimentarios (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade,
  fecha       date not null,
  desayuno    text,
  col_manana  text,
  almuerzo    text,
  merienda    text,
  col_tarde   text,
  cena        text
);

-- ─── ÍNDICES PARA BÚSQUEDAS RÁPIDAS ──────────────────────────────────────────
create index if not exists idx_pacientes_estado       on pacientes(estado);
create index if not exists idx_pacientes_dni          on pacientes(dni);
create index if not exists idx_antro_paciente         on antropometrias(paciente_id);
create index if not exists idx_consultas_paciente     on consultas_seguimiento(paciente_id);
create index if not exists idx_alimentos_nombre       on alimentos_db(nombre);
create index if not exists idx_alimentos_categoria    on alimentos_db(categoria);
create index if not exists idx_items_plan_plan        on items_plan(plan_id);

-- ─── CONFIRMAR CREACIÓN ──────────────────────────────────────────────────────
select 
  table_name as "Tabla creada ✓",
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as "Tamaño"
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
