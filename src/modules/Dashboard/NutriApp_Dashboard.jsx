import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// ─── DATOS MOCK ──────────────────────────────────────────────────────────────
const PACIENTES_HOY = [
  { id: 1, nombre: "Valentina Rodríguez", hora: "09:00", tipo: "C2", peso_inicial: 78.4, peso_actual: 75.1, imc: 27.2, estado: "En progreso", avatar: "VR", tag_color: "#1D9E75" },
  { id: 2, nombre: "Luciana Méndez",      hora: "10:30", tipo: "Ingreso", peso_inicial: 92.0, peso_actual: 92.0, imc: 31.4, estado: "Nuevo",      avatar: "LM", tag_color: "#7F77DD" },
  { id: 3, nombre: "Sofía Castillo",      hora: "12:00", tipo: "C4", peso_inicial: 68.0, peso_actual: 61.5, imc: 22.8, estado: "En progreso", avatar: "SC", tag_color: "#1D9E75" },
  { id: 4, nombre: "Mariana Torres",      hora: "14:00", tipo: "C1", peso_inicial: 85.5, peso_actual: 83.2, imc: 29.6, estado: "En progreso", avatar: "MT", tag_color: "#1D9E75" },
  { id: 5, nombre: "Ana Laura Gómez",     hora: "16:30", tipo: "C5", peso_inicial: 72.0, peso_actual: 65.8, imc: 23.1, estado: "Alta",        avatar: "AG", tag_color: "#378ADD" },
];

const TODOS_PACIENTES = [
  { id: 1,  nombre: "Valentina Rodríguez", edad: 34, imc: 27.2, consultas: 2, estado: "activo",    ultima: "hoy",      perdida: -3.3 },
  { id: 2,  nombre: "Luciana Méndez",      edad: 28, imc: 31.4, consultas: 0, estado: "nuevo",     ultima: "hoy",      perdida: 0 },
  { id: 3,  nombre: "Sofía Castillo",      edad: 41, imc: 22.8, consultas: 4, estado: "activo",    ultima: "hoy",      perdida: -6.5 },
  { id: 4,  nombre: "Mariana Torres",      edad: 37, imc: 29.6, consultas: 1, estado: "activo",    ultima: "hoy",      perdida: -2.3 },
  { id: 5,  nombre: "Ana Laura Gómez",     edad: 52, imc: 23.1, consultas: 5, estado: "alta",      ultima: "hoy",      perdida: -6.2 },
  { id: 6,  nombre: "Camila Herrera",      edad: 25, imc: 24.5, consultas: 3, estado: "activo",    ultima: "ayer",     perdida: -4.1 },
  { id: 7,  nombre: "Romina Sánchez",      edad: 44, imc: 33.8, consultas: 2, estado: "activo",    ultima: "21/06",    perdida: -1.8 },
  { id: 8,  nombre: "Paula Jiménez",       edad: 30, imc: 26.1, consultas: 1, estado: "activo",    ultima: "18/06",    perdida: -0.9 },
  { id: 9,  nombre: "Florencia Núñez",     edad: 38, imc: 28.7, consultas: 3, estado: "pausa",     ultima: "05/06",    perdida: -3.5 },
  { id: 10, nombre: "Daniela Mora",        edad: 29, imc: 21.4, consultas: 5, estado: "alta",      ultima: "01/06",    perdida: -7.2 },
  { id: 11, nombre: "Gabriela Ortiz",      edad: 56, imc: 30.2, consultas: 4, estado: "activo",    ultima: "28/05",    perdida: -2.6 },
  { id: 12, nombre: "Lucía Fernández",     edad: 33, imc: 25.9, consultas: 2, estado: "activo",    ultima: "25/05",    perdida: -1.4 },
];

const PESO_GRUPAL_DATA = [
  { semana: "S1",  promedio: 81.2 },
  { semana: "S2",  promedio: 80.5 },
  { semana: "S3",  promedio: 79.8 },
  { semana: "S4",  promedio: 79.1 },
  { semana: "S5",  promedio: 78.3 },
  { semana: "S6",  promedio: 77.9 },
  { semana: "S7",  promedio: 77.4 },
  { semana: "S8",  promedio: 76.8 },
  { semana: "S9",  promedio: 76.1 },
  { semana: "S10", promedio: 75.6 },
  { semana: "S11", promedio: 75.0 },
  { semana: "S12", promedio: 74.5 },
];

const DISTRIBUCION_ESTADO = [
  { label: "Activos",   valor: 7,  color: "#1D9E75", pct: 58 },
  { label: "Nuevos",    valor: 1,  color: "#7F77DD", pct: 8  },
  { label: "Alta",      valor: 2,  color: "#378ADD", pct: 17 },
  { label: "En pausa",  valor: 1,  color: "#EF9F27", pct: 8  },
  { label: "Inactivos", valor: 1,  color: "#D3D1C7", pct: 9  },
];

const ESTADO_CONFIG = {
  activo:   { label: "Activo",    bg: "#E1F5EE", color: "#0F6E56" },
  nuevo:    { label: "Nuevo",     bg: "#EEEDFE", color: "#3C3489" },
  alta:     { label: "Alta",      bg: "#E6F1FB", color: "#0C447C" },
  pausa:    { label: "Pausa",     bg: "#FAEEDA", color: "#633806" },
  inactivo: { label: "Inactivo",  bg: "#F1EFE8", color: "#5F5E5A" },
};

const TIPO_CONFIG = {
  "Ingreso": { bg: "#EEEDFE", color: "#3C3489" },
  "C1":      { bg: "#E1F5EE", color: "#0F6E56" },
  "C2":      { bg: "#E1F5EE", color: "#0F6E56" },
  "C3":      { bg: "#E1F5EE", color: "#0F6E56" },
  "C4":      { bg: "#E1F5EE", color: "#0F6E56" },
  "C5":      { bg: "#E6F1FB", color: "#0C447C" },
};

// ─── COMPONENTES AUXILIARES ─────────────────────────────────────────────────

function Avatar({ initials, size = 36 }) {
  const colors = { V:"#1D9E75", L:"#7F77DD", S:"#378ADD", M:"#D85A30", A:"#0F6E56", C:"#185FA5", R:"#633806", P:"#3C3489", F:"#EF9F27", D:"#0C447C", G:"#712B13", G2:"#4B1528" };
  const bg = colors[initials[0]] || "#1D9E75";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg + "22", border: `1.5px solid ${bg}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 500, color: bg, flexShrink: 0,
      letterSpacing: "0.02em"
    }}>{initials}</div>
  );
}

function Pill({ label, bg, color }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub, accent, trend, icon }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E6DF", borderRadius: 14,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#888780", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 300, color: "#2C2C2A", lineHeight: 1, fontFamily: "Georgia, serif" }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {trend && (
          <span style={{ fontSize: 11, color: accent, fontWeight: 500, background: accent + "15", padding: "1px 6px", borderRadius: 8 }}>
            {trend}
          </span>
        )}
        <span style={{ fontSize: 11, color: "#B4B2A9" }}>{sub}</span>
      </div>
    </div>
  );
}

function IMCBadge({ imc }) {
  const getConfig = (v) => {
    if (v < 18.5) return { label: "Bajo peso", color: "#378ADD", bg: "#E6F1FB" };
    if (v < 25)   return { label: "Normal",     color: "#0F6E56", bg: "#E1F5EE" };
    if (v < 30)   return { label: "Sobrepeso",  color: "#633806", bg: "#FAEEDA" };
    return               { label: "Obesidad",   color: "#712B13", bg: "#FAECE7" };
  };
  const c = getConfig(imc);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{imc.toFixed(1)}</span>
      <Pill label={c.label} bg={c.bg} color={c.color} />
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 11, color: "#888780" }}>{payload[0].payload.semana}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#2C2C2A" }}>{payload[0].value} kg</div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◈", active: true },
  { id: "ingreso",   label: "Ingreso / Anamnesis", icon: "◎" },
  { id: "antro",     label: "Antropometría", icon: "◉" },
  { id: "plan",      label: "Plan Alimentario", icon: "◐" },
  { id: "seguimiento", label: "Seguimiento", icon: "◑" },
  { id: "registro",  label: "Registro Alimentario", icon: "◒" },
];

function Sidebar({ collapsed, activeNav, setActiveNav }) {
  return (
    <aside style={{
      width: collapsed ? 60 : 220, flexShrink: 0,
      background: "#FAFAF8", borderRight: "1px solid #E8E6DF",
      display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden", minHeight: "100vh"
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #E8E6DF", height: 64 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: 16, color: "#fff"
        }}>✦</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", letterSpacing: "-0.01em" }}>NutriApp</div>
            <div style={{ fontSize: 10, color: "#B4B2A9" }}>Consultorio digital</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", display: "flex", flexDirection: "column", gap: 1 }}>
        {!collapsed && <div style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 20px 8px" }}>Principal</div>}
        {NAV_ITEMS.slice(0,1).map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
        ))}
        {!collapsed && <div style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 20px 8px" }}>Módulos</div>}
        {!collapsed && <div style={{ height: 1, background: "#E8E6DF", margin: "2px 0" }}/>}
        {NAV_ITEMS.slice(1).map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? "16px 0" : "16px 20px", borderTop: "1px solid #E8E6DF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials="NA" size={30} />
          {!collapsed && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>Nutricionista</div>
              <div style={{ fontSize: 10, color: "#B4B2A9" }}>Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, collapsed, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: collapsed ? "10px 0" : "9px 20px",
      justifyContent: collapsed ? "center" : "flex-start",
      background: active ? "#E1F5EE" : "transparent",
      border: "none", cursor: "pointer", width: "100%",
      borderLeft: active ? "2.5px solid #1D9E75" : "2.5px solid transparent",
      transition: "all 0.12s",
      borderRadius: collapsed ? 0 : 0,
    }}>
      <span style={{ fontSize: 15, color: active ? "#0F6E56" : "#888780", flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ fontSize: 12, fontWeight: active ? 500 : 400, color: active ? "#0F6E56" : "#5F5E5A", whiteSpace: "nowrap" }}>{item.label}</span>}
    </button>
  );
}

// ─── BUSCADOR ────────────────────────────────────────────────────────────────

function SearchBar({ query, setQuery, resultCount }) {
  return (
    <div style={{ position: "relative", maxWidth: 400 }}>
      <div style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        fontSize: 13, color: "#B4B2A9", pointerEvents: "none"
      }}>⌕</div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar paciente por nombre, DNI…"
        style={{
          width: "100%", padding: "9px 12px 9px 34px",
          border: "1.5px solid #E8E6DF", borderRadius: 10,
          fontSize: 12, color: "#2C2C2A", background: "#fff",
          outline: "none", transition: "border-color 0.15s",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = "#1D9E75"}
        onBlur={e => e.target.style.borderColor = "#E8E6DF"}
      />
      {query && (
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#B4B2A9" }}>
          {resultCount} resultado{resultCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ─── TABLA DE PACIENTES ──────────────────────────────────────────────────────

function PacientesTable({ pacientes, filtroEstado, setFiltroEstado }) {
  const estados = ["todos", "activo", "nuevo", "alta", "pausa"];
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Filtros */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E6DF", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#888780", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginRight: 4 }}>Filtrar:</span>
        {estados.map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)} style={{
            fontSize: 11, padding: "4px 12px", borderRadius: 20,
            border: "1.5px solid",
            borderColor: filtroEstado === e ? "#1D9E75" : "#E8E6DF",
            background: filtroEstado === e ? "#E1F5EE" : "#fff",
            color: filtroEstado === e ? "#0F6E56" : "#888780",
            cursor: "pointer", fontWeight: filtroEstado === e ? 500 : 400,
            transition: "all 0.12s", fontFamily: "inherit",
            textTransform: "capitalize"
          }}>{e === "todos" ? "Todos" : ESTADO_CONFIG[e]?.label || e}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#B4B2A9" }}>{pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cabecera */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 0.6fr 0.7fr 0.8fr 1fr", padding: "10px 20px", background: "#FAFAF8", borderBottom: "1px solid #E8E6DF" }}>
        {["Paciente", "Edad", "IMC", "Consultas", "Estado", "Últ. consulta"].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</span>
        ))}
      </div>

      {/* Filas */}
      {pacientes.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#B4B2A9", fontSize: 12 }}>Sin resultados</div>
      ) : (
        pacientes.map((p, i) => {
          const ec = ESTADO_CONFIG[p.estado] || {};
          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "2fr 0.6fr 0.6fr 0.7fr 0.8fr 1fr",
              padding: "13px 20px", borderBottom: i < pacientes.length - 1 ? "1px solid #F1EFE8" : "none",
              alignItems: "center", transition: "background 0.1s", cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={p.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)} size={30} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{p.nombre}</div>
                  {p.perdida !== 0 && (
                    <div style={{ fontSize: 10, color: "#1D9E75" }}>
                      {p.perdida.toFixed(1)} kg desde ingreso
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#5F5E5A" }}>{p.edad} a.</span>
              <IMCBadge imc={p.imc} />
              <span style={{ fontSize: 12, color: "#5F5E5A" }}>{p.consultas} / 5</span>
              <Pill label={ec.label || p.estado} bg={ec.bg || "#F1EFE8"} color={ec.color || "#5F5E5A"} />
              <span style={{ fontSize: 11, color: "#B4B2A9" }}>{p.ultima}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── PACIENTES DEL DÍA ───────────────────────────────────────────────────────

function PacientesHoy({ pacientes }) {
  const [expandido, setExpandido] = useState(null);
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E6DF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>Pacientes del día</div>
          <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <div style={{ fontSize: 11, background: "#E1F5EE", color: "#0F6E56", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
          {pacientes.length} turnos
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {pacientes.map((p, i) => {
          const tc = TIPO_CONFIG[p.tipo] || {};
          const diff = (p.peso_actual - p.peso_inicial).toFixed(1);
          const isExp = expandido === p.id;
          return (
            <div key={p.id}
              onClick={() => setExpandido(isExp ? null : p.id)}
              style={{ borderBottom: i < pacientes.length - 1 ? "1px solid #F1EFE8" : "none", cursor: "pointer" }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                transition: "background 0.1s", background: isExp ? "#FAFAF8" : "transparent",
              }}
                onMouseEnter={e => !isExp && (e.currentTarget.style.background = "#FAFAF8")}
                onMouseLeave={e => !isExp && (e.currentTarget.style.background = "transparent")}
              >
                {/* Hora */}
                <div style={{ width: 40, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#2C2C2A" }}>{p.hora}</div>
                </div>
                {/* Línea de tiempo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: 16, flexShrink: 0 }}>
                  <div style={{ width: 1, height: 6, background: i === 0 ? "transparent" : "#E8E6DF" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.tag_color, flexShrink: 0 }} />
                  <div style={{ width: 1, height: 6, background: i === pacientes.length - 1 ? "transparent" : "#E8E6DF" }} />
                </div>
                {/* Info */}
                <Avatar initials={p.avatar} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
                  <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>IMC {p.imc}</div>
                </div>
                <Pill label={p.tipo} bg={tc.bg || "#E1F5EE"} color={tc.color || "#0F6E56"} />
                <div style={{ fontSize: 12, color: diff <= 0 ? "#0F6E56" : "#D85A30", fontWeight: 500, minWidth: 48, textAlign: "right" }}>
                  {diff <= 0 ? "" : "+"}{diff} kg
                </div>
              </div>
              {/* Detalle expandible */}
              {isExp && (
                <div style={{ padding: "0 20px 14px 88px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: "#B4B2A9" }}>Peso inicial: </span>
                    <span style={{ color: "#2C2C2A", fontWeight: 500 }}>{p.peso_inicial} kg</span>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: "#B4B2A9" }}>Peso actual: </span>
                    <span style={{ color: "#2C2C2A", fontWeight: 500 }}>{p.peso_actual} kg</span>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: "#B4B2A9" }}>Estado: </span>
                    <span style={{ color: "#2C2C2A", fontWeight: 500 }}>{p.estado}</span>
                  </div>
                  <button style={{
                    fontSize: 11, padding: "4px 12px", borderRadius: 8,
                    background: "#1D9E75", color: "#fff", border: "none",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 500
                  }}>Abrir historia clínica →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MINI DONUT ──────────────────────────────────────────────────────────────

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  let offset = 0;
  const r = 38, cx = 50, cy = 50, stroke = 10;
  const circum = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {data.map((d, i) => {
          const len = (d.valor / total) * circum;
          const gap = 2;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${len - gap} ${circum - len + gap}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 0.5s" }}
            />
          );
          offset += len;
          return seg;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={300} fill="#2C2C2A" fontFamily="Georgia, serif">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8} fill="#B4B2A9">pacientes</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#5F5E5A" }}>{d.label}</span>
            <span style={{ fontSize: 11, color: "#B4B2A9", marginLeft: "auto" }}>{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ─────────────────────────────────────────────────────

export default function NutriDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const pacientesFiltrados = TODOS_PACIENTES
    .filter(p => {
      const matchQuery = p.nombre.toLowerCase().includes(query.toLowerCase());
      const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
      return matchQuery && matchEstado;
    });

  const promPerdida = (TODOS_PACIENTES.filter(p => p.perdida < 0).reduce((s, p) => s + p.perdida, 0) / TODOS_PACIENTES.filter(p => p.perdida < 0).length).toFixed(1);

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: "#F5F4F0",
      fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      color: "#2C2C2A", fontSize: 13,
    }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          height: 64, background: "#fff", borderBottom: "1px solid #E8E6DF",
          display: "flex", alignItems: "center", padding: "0 28px",
          gap: 16, position: "sticky", top: 0, zIndex: 10
        }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
            color: "#888780", fontSize: 16, display: "flex", alignItems: "center",
          }}>☰</button>
          <div style={{ flex: 1 }}>
            <SearchBar query={query} setQuery={setQuery} resultCount={pacientesFiltrados.length} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ background: "none", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 500, color: "#2C2C2A", cursor: "pointer", fontFamily: "inherit" }}>
              + Nuevo paciente
            </button>
            <button style={{ background: "#1D9E75", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header */}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: "#2C2C2A", margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}>
              Bienvenida ✦
            </h1>
            <p style={{ fontSize: 12, color: "#B4B2A9", margin: "4px 0 0" }}>
              {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <MetricCard label="Total pacientes" value={TODOS_PACIENTES.length} sub="registrados" accent="#1D9E75" trend="+2 este mes" icon="◈" />
            <MetricCard label="Turnos hoy" value={PACIENTES_HOY.length} sub="programados" accent="#7F77DD" trend="2 pm próximo" icon="◎" />
            <MetricCard label="Pérdida promedio" value={`${promPerdida} kg`} sub="por paciente activo" accent="#378ADD" trend="↓ progreso grupal" icon="◐" />
            <MetricCard label="Consultas activas" value={TODOS_PACIENTES.filter(p=>p.estado==="activo").length} sub="pacientes en seguimiento" accent="#D85A30" trend={`${TODOS_PACIENTES.filter(p=>p.estado==="alta").length} de alta`} icon="◑" />
          </div>

          {/* Fila principal: hoy + gráfico */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>

            {/* Pacientes del día */}
            <PacientesHoy pacientes={PACIENTES_HOY} />

            {/* Panel lateral */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Donut distribución */}
              <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A", marginBottom: 14 }}>Distribución por estado</div>
                <DonutChart data={DISTRIBUCION_ESTADO} />
              </div>

              {/* Gráfico tendencia grupal */}
              <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A", marginBottom: 4 }}>Tendencia grupal de peso</div>
                <div style={{ fontSize: 10, color: "#B4B2A9", marginBottom: 14 }}>Promedio últimas 12 semanas</div>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={PESO_GRUPAL_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTendencia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="semana" tick={{ fontSize: 9, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[73, 83]} tick={{ fontSize: 9, fill: "#B4B2A9" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="promedio" stroke="#1D9E75" strokeWidth={1.5} fill="url(#gradTendencia)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: "#B4B2A9" }}>Inicio: 81.2 kg</div>
                  <div style={{ fontSize: 10, color: "#1D9E75", fontWeight: 500 }}>Actual: 74.5 kg  (−6.7 kg)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de todos los pacientes */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>Todos los pacientes</div>
                {query && <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>Mostrando resultados para "{query}"</div>}
              </div>
            </div>
            <PacientesTable pacientes={pacientesFiltrados} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} />
          </div>

        </div>
      </main>
    </div>
  );
}
