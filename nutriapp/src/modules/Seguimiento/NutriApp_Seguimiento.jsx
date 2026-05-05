import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from "recharts";

// ─── DATOS MOCK ──────────────────────────────────────────────────────────────
const PACIENTE = {
  id: 3,
  nombre: "Sofía Castillo",
  edad: 41,
  sexo: "Femenino",
  patron: "Omnívora",
  imc_inicial: 26.8,
  peso_inicial: 68.0,
  talla: 159,
  peso_objetivo: 61.0,
  fecha_ingreso: "2025-02-10",
};

const CONSULTAS = [
  {
    numero: 1, fecha: "2025-02-10", tipo: "Ingreso", peso: 68.0, imc: 26.8,
    cintura: 88, cadera: 102, tension: "120/80", estado: "completada",
    motivacion: "Muy motivada. Refiere que quiere cambiar su relación con la comida.",
    picoteo: "Picoteo nocturno frecuente, especialmente dulces.",
    organizacion: "No planifica las comidas. Come lo que encuentra disponible.",
    bebidas: "Toma 1L de agua al día. Mate con azúcar x3. Gaseosa light x1.",
    sintomasGI: "Distensión abdominal frecuente, gases post almuerzo.",
    actividadFisica: "Sin actividad física estructurada. Camina al trabajo (~15 min/día).",
    recordatorio: "Desayuno: café con leche + 2 tostadas con manteca.\nAlmuerzo: milanesa con papas fritas (comedor).\nMerienda: galletitas dulces (1 paquete).\nCena: omelet + ensalada.",
    objetivos: "Reducir picoteo nocturno. Aumentar hidratación a 2L. Incorporar colaciones planificadas.",
    plan: "Se diseñó plan de 1600 kcal con distribución 50/20/30 (HC/P/G).",
    suma6pliegues: 98, masaGrasa: 28.4, masaMuscular: 22.1,
  },
  {
    numero: 2, fecha: "2025-03-03", tipo: "C1", peso: 66.2, imc: 26.2,
    cintura: 86, cadera: 100, tension: "118/78", estado: "completada",
    motivacion: "Sigue motivada aunque tuvo una semana difícil por trabajo.",
    picoteo: "Redujo picoteo nocturno a 3 veces por semana. Elige fruta.",
    organizacion: "Comenzó a planificar el almuerzo. Lleva vianda 4 días.",
    bebidas: "Aumentó agua a 1.5L. Eliminó gaseosa. Mantiene mate.",
    sintomasGI: "Menos distensión. Identificó que el pan blanco le genera malestar.",
    actividadFisica: "Sumó 2 caminatas largas (30 min) por semana.",
    recordatorio: "Desayuno: yogur + avena + fruta.\nAlmuerzo: pollo al horno + ensalada + quinoa.\nMerienda: fruta + frutos secos.\nCena: vegetales salteados + huevo.",
    objetivos: "Continuar con plan. Incorporar legumbres. Evaluar gluten.",
    plan: "Se mantiene el plan 1600 kcal. Se ajusta colación mañana.",
    suma6pliegues: 94, masaGrasa: 27.1, masaMuscular: 22.5,
  },
  {
    numero: 3, fecha: "2025-03-24", tipo: "C2", peso: 64.8, imc: 25.6,
    cintura: 84, cadera: 99, tension: "115/75", estado: "completada",
    motivacion: "Muy contenta con los resultados. Refiere que se siente más liviana.",
    picoteo: "Picoteo ocasional (1-2x semana). Bien controlado.",
    organizacion: "Organiza comidas el domingo. Prepara viandas para 5 días.",
    bebidas: "2L de agua consistentemente. Mate sin azúcar.",
    sintomasGI: "Sin distensión. Confirmó sensibilidad al trigo (no celíaca).",
    actividadFisica: "Incorporó yoga 1x semana + caminatas regulares.",
    recordatorio: "Desayuno: tostadas integrales + palta + huevo.\nAlmuerzo: legumbres + verduras.\nMerienda: fruta + queso.\nCena: sopa + proteína magra.",
    objetivos: "Mantener momentum. Ajustar proteínas. Próxima meta: 63 kg.",
    plan: "Plan ajustado a 1550 kcal. Se aumenta proteína a 25%.",
    suma6pliegues: 89, masaGrasa: 25.6, masaMuscular: 23.0,
  },
  {
    numero: 4, fecha: "2025-04-14", tipo: "C3", peso: 63.1, imc: 24.9,
    cintura: 82, cadera: 97, tension: "112/74", estado: "completada",
    motivacion: "Excelente. Menciona que sus colegas le preguntaron qué está haciendo.",
    picoteo: "Sin picoteo compulsivo. Colaciones planificadas.",
    organizacion: "Muy organizada. Cocina batch cooking los domingos.",
    bebidas: "Hidratación óptima. Incorporó infusiones naturales.",
    sintomasGI: "Sin síntomas. Come sin gluten por elección.",
    actividadFisica: "Yoga 2x + caminatas. Pensando en sumar pilates.",
    recordatorio: "Dieta variada y equilibrada. Incorporó semillas y frutos secos.",
    objetivos: "Llegar a 62 kg. Mantener masa muscular. Iniciar fuerza.",
    plan: "Plan 1500 kcal. Se incorpora entrenamiento de fuerza liviano.",
    suma6pliegues: 84, masaGrasa: 24.2, masaMuscular: 23.4,
  },
  {
    numero: 5, fecha: "2025-04-28", tipo: "C4", peso: 61.5, imc: 24.3,
    cintura: 79, cadera: 95, tension: "110/72", estado: "hoy",
    motivacion: "Logró el peso objetivo. Quiere pasar a mantenimiento.",
    picoteo: "No hay picoteo compulsivo. Come con conciencia.",
    organizacion: "Autónoma. Ya no necesita planilla.",
    bebidas: "Hidratación excelente.",
    sintomasGI: "Sin síntomas digestivos.",
    actividadFisica: "Yoga 2x + pilates 1x + caminatas diarias.",
    recordatorio: "Dieta sostenible y diversa. Disfruta cocinar.",
    objetivos: "Pasar a fase de mantenimiento. Control en 2 meses.",
    plan: "Plan de mantenimiento 1650 kcal. Alta nutricional próxima consulta.",
    suma6pliegues: 78, masaGrasa: 22.5, masaMuscular: 23.8,
  },
];

const PESO_DATA = CONSULTAS.map(c => ({
  consulta: c.tipo === "Ingreso" ? "Ingreso" : c.tipo,
  fecha: c.fecha,
  peso: c.peso,
  imc: c.imc,
  masaGrasa: c.masaGrasa,
  masaMuscular: c.masaMuscular,
}));

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TIPO_CFG = {
  "Ingreso": { bg: "#EEEDFE", color: "#3C3489", border: "#7F77DD" },
  "C1": { bg: "#E1F5EE", color: "#0F6E56", border: "#1D9E75" },
  "C2": { bg: "#E1F5EE", color: "#0F6E56", border: "#1D9E75" },
  "C3": { bg: "#E1F5EE", color: "#0F6E56", border: "#1D9E75" },
  "C4": { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
  "C5": { bg: "#E6F1FB", color: "#0C447C", border: "#378ADD" },
};

const ESTADO_CFG = {
  completada: { label: "Completada", bg: "#E1F5EE", color: "#0F6E56" },
  hoy:        { label: "Consulta de hoy", bg: "#FAEEDA", color: "#633806" },
  pendiente:  { label: "Pendiente", bg: "#F1EFE8", color: "#B4B2A9" },
};

function Pill({ label, bg, color }) {
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>;
}

function SectionBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "#B4B2A9", minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: "#2C2C2A" }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#F1F0EA", margin: "14px 0" }} />;
}

// ─── TOOLTIP PERSONALIZADO ───────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 150 }}>
      <div style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>{d.consulta} — {d.fecha}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: 13, fontWeight: 500, color: p.color, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 400, color: "#5F5E5A" }}>{p.name}</span>
          <span>{p.value} {p.dataKey === "peso" ? "kg" : p.dataKey === "imc" ? "" : "kg"}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PANEL DE CONSULTA ───────────────────────────────────────────────────────
function ConsultaPanel({ consulta, pesoInicial, pesoObjetivo }) {
  const tc = TIPO_CFG[consulta.tipo] || TIPO_CFG["C1"];
  const ec = ESTADO_CFG[consulta.estado] || ESTADO_CFG["completada"];
  const diff = (consulta.peso - pesoInicial).toFixed(1);
  const progreso = Math.min(100, Math.round(((pesoInicial - consulta.peso) / (pesoInicial - pesoObjetivo)) * 100));

  return (
    <div style={{ background: "#FAFAF8", border: "1px solid #E8E6DF", borderRadius: 14, padding: "20px 22px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Pill label={consulta.tipo} bg={tc.bg} color={tc.color} />
            <Pill label={ec.label} bg={ec.bg} color={ec.color} />
          </div>
          <div style={{ fontSize: 12, color: "#B4B2A9" }}>{consulta.fecha}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 300, color: "#2C2C2A", fontFamily: "Georgia, serif", lineHeight: 1 }}>{consulta.peso} kg</div>
          <div style={{ fontSize: 11, color: diff <= 0 ? "#1D9E75" : "#D85A30", fontWeight: 500 }}>
            {diff <= 0 ? "▼" : "▲"} {Math.abs(diff)} kg desde ingreso
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "IMC", value: consulta.imc.toFixed(1), unit: "" },
          { label: "Cintura", value: consulta.cintura, unit: "cm" },
          { label: "% Graso", value: consulta.masaGrasa, unit: "%" },
          { label: "Masa musc.", value: consulta.masaMuscular, unit: "kg" },
        ].map(m => (
          <div key={m.label} style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 9, padding: "9px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>{m.value}<span style={{ fontSize: 9, color: "#B4B2A9", marginLeft: 1 }}>{m.unit}</span></div>
            <div style={{ fontSize: 10, color: "#B4B2A9" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Progreso hacia objetivo */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#B4B2A9", marginBottom: 4 }}>
          <span>Progreso hacia objetivo ({pesoObjetivo} kg)</span>
          <span style={{ color: "#1D9E75", fontWeight: 500 }}>{progreso}%</span>
        </div>
        <div style={{ height: 5, background: "#F1F0EA", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progreso}%`, background: "linear-gradient(90deg, #1D9E75, #0F6E56)", borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
      </div>

      <Divider />

      {/* Contenido clínico */}
      <SectionBlock title="Motivación / estado emocional">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.motivacion}</p>
      </SectionBlock>
      <SectionBlock title="Picoteo / ansiedad">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.picoteo}</p>
      </SectionBlock>
      <SectionBlock title="Organización de comidas">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.organizacion}</p>
      </SectionBlock>
      <SectionBlock title="Ingesta de bebidas e hidratación">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.bebidas}</p>
      </SectionBlock>
      <SectionBlock title="Síntomas gastrointestinales">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.sintomasGI}</p>
      </SectionBlock>
      <SectionBlock title="Actividad física">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.actividadFisica}</p>
      </SectionBlock>

      <Divider />

      <SectionBlock title="Recordatorio 24hs">
        <pre style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#fff", border: "1px solid #F1F0EA", borderRadius: 8, padding: "10px 12px" }}>
          {consulta.recordatorio}
        </pre>
      </SectionBlock>
      <SectionBlock title="Objetivos para próxima consulta">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65 }}>{consulta.objetivos}</p>
      </SectionBlock>
      <SectionBlock title="Plan / ajustes realizados">
        <p style={{ fontSize: 12, color: "#2C2C2A", lineHeight: 1.65, background: "#E1F5EE", borderRadius: 8, padding: "10px 12px" }}>{consulta.plan}</p>
      </SectionBlock>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function NutriSeguimiento({ onVolver }) {
  const [activeConsulta, setActiveConsulta] = useState(CONSULTAS.length - 1);
  const [activeChart, setActiveChart] = useState("peso");

  const totalPerdida = (CONSULTAS[0].peso - CONSULTAS[CONSULTAS.length - 1].peso).toFixed(1);
  const progreso = Math.min(100, Math.round(((PACIENTE.peso_inicial - CONSULTAS[CONSULTAS.length - 1].peso) / (PACIENTE.peso_inicial - PACIENTE.peso_objetivo)) * 100));

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", background: "#F5F4F0", minHeight: "100vh", color: "#2C2C2A" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6DF", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onVolver} style={{ background: "none", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>← Dashboard</button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>Seguimiento — {PACIENTE.nombre}</div>
          <div style={{ fontSize: 10, color: "#B4B2A9" }}>{PACIENTE.edad} años · {PACIENTE.sexo} · {PACIENTE.patron}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={{ background: "#fff", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 500, color: "#2C2C2A", cursor: "pointer", fontFamily: "inherit" }}>+ Nueva consulta</button>
          <button style={{ background: "#1D9E75", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Exportar PDF</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F0EA", padding: "9px 24px", display: "flex", gap: 6, fontSize: 11 }}>
        <span style={{ color: "#B4B2A9" }}>Dashboard</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#B4B2A9" }}>Pacientes</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#B4B2A9" }}>{PACIENTE.nombre}</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#0F6E56", fontWeight: 500 }}>Seguimiento</span>
      </div>

      <div style={{ padding: "24px", display: "flex", gap: 20, maxWidth: 1200, margin: "0 auto" }}>

        {/* Columna izquierda: resumen + gráficos + timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>

          {/* Resumen del paciente */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E1F5EE", border: "2px solid #9FE1CB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500, color: "#0F6E56", flexShrink: 0 }}>SC</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#2C2C2A" }}>{PACIENTE.nombre}</div>
                  <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>
                    {PACIENTE.edad} años · Ingreso {PACIENTE.fecha_ingreso} · {PACIENTE.talla} cm
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <Pill label="En progreso" bg="#E1F5EE" color="#0F6E56" />
                    <Pill label={PACIENTE.patron} bg="#F1EFE8" color="#5F5E5A" />
                    <Pill label={`${CONSULTAS.length} consultas`} bg="#EEEDFE" color="#3C3489" />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, flexShrink: 0 }}>
                {[
                  { label: "Peso inicial", value: `${PACIENTE.peso_inicial} kg`, color: "#5F5E5A" },
                  { label: "Peso actual", value: `${CONSULTAS[CONSULTAS.length-1].peso} kg`, color: "#2C2C2A" },
                  { label: "Pérdida total", value: `−${totalPerdida} kg`, color: "#1D9E75" },
                  { label: "Objetivo", value: `${PACIENTE.peso_objetivo} kg`, color: "#7F77DD" },
                ].map(m => (
                  <div key={m.label} style={{ background: "#F5F4F0", borderRadius: 10, padding: "10px 12px", textAlign: "center", minWidth: 80 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: m.color, fontFamily: "Georgia, serif" }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Barra objetivo */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#B4B2A9", marginBottom: 4 }}>
                <span>Progreso hacia el objetivo</span>
                <span style={{ color: "#1D9E75", fontWeight: 500 }}>{progreso}% alcanzado</span>
              </div>
              <div style={{ height: 5, background: "#F1F0EA", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progreso}%`, background: "linear-gradient(90deg, #1D9E75, #0F6E56)", borderRadius: 3, transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#D3D1C7", marginTop: 3 }}>
                <span>{PACIENTE.peso_inicial} kg</span>
                <span>{PACIENTE.peso_objetivo} kg</span>
              </div>
            </div>
          </div>

          {/* Gráficos dinámicos */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>Evolución gráfica</div>
                <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>Ingreso → C4 · {CONSULTAS.length} puntos</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { key: "peso", label: "Peso" },
                  { key: "imc", label: "IMC" },
                  { key: "composicion", label: "Composición" },
                ].map(c => (
                  <button key={c.key} onClick={() => setActiveChart(c.key)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    border: "1.5px solid", transition: "all 0.12s",
                    borderColor: activeChart === c.key ? "#1D9E75" : "#E8E6DF",
                    background: activeChart === c.key ? "#E1F5EE" : "#fff",
                    color: activeChart === c.key ? "#0F6E56" : "#5F5E5A",
                    fontWeight: activeChart === c.key ? 500 : 400,
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {activeChart === "peso" && (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={PESO_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                  <XAxis dataKey="consulta" tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[59, 70]} tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={PACIENTE.peso_objetivo} stroke="#7F77DD" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Objetivo", position: "right", fontSize: 9, fill: "#7F77DD" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="peso" name="Peso" stroke="#1D9E75" strokeWidth={2} fill="url(#gPeso)" dot={{ fill: "#1D9E75", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#0F6E56" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChart === "imc" && (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={PESO_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                  <XAxis dataKey="consulta" tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[23, 28]} tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={25} stroke="#EF9F27" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Sobrepeso", position: "right", fontSize: 9, fill: "#EF9F27" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="imc" name="IMC" stroke="#378ADD" strokeWidth={2} dot={{ fill: "#378ADD", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeChart === "composicion" && (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={PESO_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                  <XAxis dataKey="consulta" tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="masaGrasa" name="% Graso" stroke="#D85A30" strokeWidth={2} dot={{ fill: "#D85A30", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="masaMuscular" name="Masa musc." stroke="#1D9E75" strokeWidth={2} dot={{ fill: "#1D9E75", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Leyenda */}
            <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
              {activeChart === "peso" && [["#1D9E75","Peso real"],["#7F77DD","Objetivo"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
                  <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />{l}
                </div>
              ))}
              {activeChart === "imc" && [["#378ADD","IMC"],["#EF9F27","Límite sobrepeso"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
                  <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />{l}
                </div>
              ))}
              {activeChart === "composicion" && [["#D85A30","% Graso"],["#1D9E75","Masa muscular"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
                  <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />{l}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 16 }}>Línea de tiempo de consultas</div>
            <div style={{ position: "relative" }}>
              {/* Línea vertical */}
              <div style={{ position: "absolute", left: 20, top: 14, bottom: 14, width: 2, background: "linear-gradient(180deg, #1D9E75, #E8E6DF)", borderRadius: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {CONSULTAS.map((c, i) => {
                  const tc = TIPO_CFG[c.tipo] || TIPO_CFG["C1"];
                  const ec = ESTADO_CFG[c.estado] || ESTADO_CFG["completada"];
                  const isActive = activeConsulta === i;
                  const diff = i === 0 ? "—" : `${(c.peso - CONSULTAS[0].peso).toFixed(1)} kg`;
                  return (
                    <div key={c.numero} onClick={() => setActiveConsulta(i)} style={{
                      display: "flex", alignItems: "flex-start", gap: 14, padding: "10px 10px 10px 0", cursor: "pointer",
                      position: "relative",
                    }}>
                      {/* Nodo */}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                        border: `2px solid ${isActive ? tc.border : "#E8E6DF"}`,
                        background: isActive ? tc.bg : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s", marginLeft: 1,
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? tc.color : "#B4B2A9" }}>
                          {c.tipo}
                        </span>
                      </div>
                      {/* Contenido */}
                      <div style={{
                        flex: 1, background: isActive ? "#FAFAF8" : "transparent",
                        border: `1.5px solid ${isActive ? "#E8E6DF" : "transparent"}`,
                        borderRadius: 10, padding: isActive ? "10px 12px" : "6px 8px", transition: "all 0.15s",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, color: "#2C2C2A" }}>{c.fecha}</div>
                            <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>{c.actividadFisica.slice(0, 50)}…</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>{c.peso} kg</div>
                            {i > 0 && <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 500 }}>{diff}</div>}
                          </div>
                        </div>
                        {isActive && (
                          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            <Pill label={ec.label} bg={ec.bg} color={ec.color} />
                            <Pill label={`IMC ${c.imc}`} bg="#F1EFE8" color="#5F5E5A" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Próxima consulta placeholder */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 10px 6px 0", opacity: 0.4 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px dashed #D3D1C7", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 1 }}>
                    <span style={{ fontSize: 16, color: "#D3D1C7" }}>+</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#B4B2A9" }}>Alta / próxima consulta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: detalle de consulta seleccionada */}
        <div style={{ width: 380, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 70, maxHeight: "calc(100vh - 90px)", overflowY: "auto" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Detalle de consulta</span>
              <span style={{ fontSize: 10, color: "#B4B2A9", fontWeight: 400 }}>← clic en la línea de tiempo</span>
            </div>
            <ConsultaPanel
              consulta={CONSULTAS[activeConsulta]}
              pesoInicial={PACIENTE.peso_inicial}
              pesoObjetivo={PACIENTE.peso_objetivo}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
