import { useState, useRef } from "react";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "personal",     label: "Datos Personales",       icon: "◎" },
  { id: "antecedentes", label: "Antecedentes Clínicos",  icon: "◉" },
  { id: "estilo",       label: "Estilo de Vida",          icon: "◐" },
  { id: "nutricional",  label: "Cuestionario Nutricional",icon: "◑" },
];

const ANTECEDENTES_LIST = [
  "Hipertensión arterial",
  "Diabetes / Insulino resistencia",
  "Colesterol alto (LDL, HDL)",
  "Hipertrigliceridemia",
  "Anemia",
  "Hipertiroidismo / Hipotiroidismo",
  "Síndrome de intestino irritable",
  "Enfermedad celíaca",
  "Colitis ulcerosa / Enf. de Crohn",
  "Síntomas gastrointestinales",
];

const HABITOS_HC = [
  "Pan integral o blanco","Galletas / tostadas de arroz integral",
  "Galletitas dulces o saladas (UP)","Avena, granola, quinoa inflada",
  "Pascualinas / tapas de empanada","Arroz integral / fideos integrales",
  "Papa, boniato, choclo, legumbres",
];
const HABITOS_PROT = [
  "Leche / yogur descremado","Bebidas vegetales s/azúcar",
  "Queso untable / vegetal","Queso fresco / tofu",
  "Huevo","Carne roja","Carne blanca (pollo/pescado)",
  "Texturizado de soja","Enlatados (atún, choclo)",
];
const HABITOS_FYVERD = [
  "Frutas (con o sin piel)","Espinaca","Acelga","Apio",
  "Brócoli","Zanahoria","Tomate","Pepino","Lechuga / rúcula",
];
const HABITOS_GRASAS = [
  "Palta / aceitunas","Frutos secos y semillas",
  "Mantequilla de maní","Aceite como condimento",
  "Manteca / margarina",
];
const HABITOS_OTROS = [
  "Mermelada / dulces","Azúcar o edulcorante","Ultraprocesados",
  "Alcohol","Mate / café / té",
];

const FREC_OPTIONS = ["Nunca","1-2 x semana","3-4 x semana","5-6 x semana","Diario","Varios x día"];

const TIPO_CONSULTA = ["Presencial","Online","Mixta"];
const PATRON_ALI = ["Omnívoro","Ovolactovegetariano","Vegetariano","Vegano","Otro"];
const ACTIVIDAD_TIPO = ["Sedentario","Caminata liviana","Ejercicio moderado (3x/sem)","Ejercicio intenso (5x/sem)","Atleta / alta performance"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function calcEdad(fechaNac) {
  if (!fechaNac) return "";
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad > 0 ? edad : "";
}

function validateDNI(v) {
  const clean = v.replace(/\D/g, "");
  return clean.length >= 7 && clean.length <= 9;
}

function formatDNI(v) {
  const clean = v.replace(/\D/g, "").slice(0, 9);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return clean.slice(0,3)+"."+clean.slice(3);
  return clean.slice(0,2)+"."+clean.slice(2,5)+"."+clean.slice(5);
}

// ─── SUB-COMPONENTES ─────────────────────────────────────────────────────────

function Label({ text, required }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 500, color: "#5F5E5A", letterSpacing: "0.02em", display: "block", marginBottom: 5 }}>
      {text}{required && <span style={{ color: "#D85A30", marginLeft: 2 }}>*</span>}
    </label>
  );
}

function Input({ label, required, error, hint, style: sx, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", ...sx }}>
      {label && <Label text={label} required={required} />}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          padding: "9px 12px", border: `1.5px solid ${error ? "#D85A30" : focused ? "#1D9E75" : "#E8E6DF"}`,
          borderRadius: 9, fontSize: 13, color: "#2C2C2A", background: "#fff",
          outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", width: "100%",
          boxSizing: "border-box",
        }}
      />
      {error && <span style={{ fontSize: 10, color: "#D85A30", marginTop: 3 }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 10, color: "#B4B2A9", marginTop: 3 }}>{hint}</span>}
    </div>
  );
}

function Textarea({ label, required, hint, rows = 3, style: sx, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", ...sx }}>
      {label && <Label text={label} required={required} />}
      <textarea
        {...props}
        rows={rows}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          padding: "9px 12px", border: `1.5px solid ${focused ? "#1D9E75" : "#E8E6DF"}`,
          borderRadius: 9, fontSize: 13, color: "#2C2C2A", background: "#fff",
          outline: "none", fontFamily: "inherit", resize: "vertical",
          lineHeight: 1.6, transition: "border-color 0.15s",
          width: "100%", boxSizing: "border-box", minHeight: rows * 26,
        }}
      />
      {hint && <span style={{ fontSize: 10, color: "#B4B2A9", marginTop: 3 }}>{hint}</span>}
    </div>
  );
}

function Select({ label, required, options, style: sx, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", ...sx }}>
      {label && <Label text={label} required={required} />}
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "9px 12px", border: `1.5px solid ${focused ? "#1D9E75" : "#E8E6DF"}`,
          borderRadius: 9, fontSize: 13, color: props.value ? "#2C2C2A" : "#B4B2A9",
          background: "#fff", outline: "none", fontFamily: "inherit",
          transition: "border-color 0.15s", width: "100%", boxSizing: "border-box",
          appearance: "none", cursor: "pointer",
        }}
      >
        <option value="">Seleccionar…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      {label && <Label text={label} />}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1.5px solid", transition: "all 0.12s", fontFamily: "inherit",
            borderColor: value === o ? "#1D9E75" : "#E8E6DF",
            background: value === o ? "#E1F5EE" : "#fff",
            color: value === o ? "#0F6E56" : "#5F5E5A",
            fontWeight: value === o ? 500 : 400,
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 1 }}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: value ? "#1D9E75" : "#E8E6DF", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: value ? 19 : 3,
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </button>
    </div>
  );
}

function SectionCard({ title, subtitle, children, icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F0EA", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#0F6E56", flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

function Grid({ cols = 2, gap = 16, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#F1F0EA" }} />
      <span style={{ fontSize: 10, color: "#B4B2A9", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#F1F0EA" }} />
    </div>
  );
}

// ─── ANTECEDENTE ROW ─────────────────────────────────────────────────────────
function AntecRow({ enf, data, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 1fr", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F0EA" }}>
      <span style={{ fontSize: 12, color: "#2C2C2A" }}>{enf}</span>
      <Toggle value={data.personal} onChange={v => onChange({ ...data, personal: v })} label="" />
      <Toggle value={data.familiar} onChange={v => onChange({ ...data, familiar: v })} label="" />
      <Input placeholder="Medicación…" value={data.med} onChange={e => onChange({ ...data, med: e.target.value })} />
    </div>
  );
}

// ─── HABITO ROW ──────────────────────────────────────────────────────────────
function HabitoRow({ alimento, data, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 160px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F1F0EA" }}>
      <span style={{ fontSize: 12, color: "#2C2C2A" }}>{alimento}</span>
      <Toggle value={data.consume} onChange={v => onChange({ ...data, consume: v })} label="" />
      {data.consume ? (
        <Select options={FREC_OPTIONS} value={data.frecuencia} onChange={e => onChange({ ...data, frecuencia: e.target.value })} />
      ) : (
        <span style={{ fontSize: 11, color: "#D3D1C7" }}>—</span>
      )}
    </div>
  );
}

// ─── BARRA DE PROGRESO ───────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 3, background: "#F1F0EA", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#1D9E75", borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 10, color: "#B4B2A9", minWidth: 30 }}>{pct}%</span>
    </div>
  );
}

// ─── CONFIRMACIÓN FINAL ───────────────────────────────────────────────────────
function ConfirmModal({ nombre, onConfirm, onBack }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,44,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>✦</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: "#2C2C2A", fontFamily: "Georgia, serif", marginBottom: 8 }}>Historia clínica lista</div>
        <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.6, marginBottom: 24 }}>
          El ingreso de <strong>{nombre}</strong> fue guardado correctamente.<br />
          El módulo de <strong>Antropometría</strong> ya está habilitado para cargar la primera valoración.
        </div>
        <div style={{ background: "#F5F4F0", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Próximos pasos</div>
          {["Completar valoración antropométrica (Nivel 1/2)","Calcular requerimiento calórico","Diseñar plan alimentario inicial"].map((s,i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
              <span style={{ fontSize: 12, color: "#5F5E5A" }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBack} style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6DF", borderRadius: 10, background: "#fff", fontSize: 13, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>
            Volver al formulario
          </button>
          <button onClick={onConfirm} style={{ flex: 1.4, padding: "10px", border: "none", borderRadius: 10, background: "#1D9E75", fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            Ir a Antropometría →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ESTADO INICIAL ───────────────────────────────────────────────────────────
const initAntec = () => Object.fromEntries(ANTECEDENTES_LIST.map(e => [e, { personal: false, familiar: false, med: "" }]));
const initHabito = (list) => Object.fromEntries(list.map(a => [a, { consume: false, frecuencia: "" }]));

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function NutriIngreso({ onVolver, onIrAntropometria }) {
  const [step, setStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const topRef = useRef(null);

  // ── Estado del formulario ──
  const [personal, setPersonal] = useState({
    nombre: "", apellido: "", dni: "", fechaNac: "", sexo: "", tipoConsulta: "",
    provincia: "", localidad: "", email: "", telefono: "",
    autopercepcion: "", asistenciaPsi: false, frecPsi: "",
  });

  const [anamnesis, setAnamnesis] = useState({
    primeraVez: "", motivoConsulta: "", ocupacion: "",
    viveSolo: "", quienCocina: "", saleComerAfuera: false, frecSalidas: "",
    patronAlimentario: "", alergias: "", laboratorio: "",
    medicacion: "",
  });

  const [antecedentes, setAntecedentes] = useState(initAntec());

  const [estilo, setEstilo] = useState({
    actividadFisica: "", tipoActividad: "", frecActividad: "", horarioAct: "",
    comidasPrePost: "", hidratacion: "", gustoEjercicio: false,
    observaciones: "",
  });

  const [nutricional, setNutricional] = useState({
    desayuno: "", colMañana: "", almuerzo: "", merienda: "", colTarde: "", cena: "",
    postres: "", bebidas: "", cantComidas: "", duracion: "", apetito: "", hambreSaciedad: "",
    estilosComida: "",
    habitosHC: initHabito(HABITOS_HC),
    habitosProt: initHabito(HABITOS_PROT),
    habitosFyV: initHabito(HABITOS_FYVERD),
    habitosGrasas: initHabito(HABITOS_GRASAS),
    habitosOtros: initHabito(HABITOS_OTROS),
  });

  const edad = calcEdad(personal.fechaNac);
  const totalSections = SECTIONS.length;

  // ── Validación por sección ──
  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!personal.nombre.trim()) errs.nombre = "Campo requerido";
      if (!personal.apellido.trim()) errs.apellido = "Campo requerido";
      if (!personal.dni || !validateDNI(personal.dni)) errs.dni = "DNI inválido (7-9 dígitos)";
      if (!personal.fechaNac) errs.fechaNac = "Campo requerido";
      if (!personal.sexo) errs.sexo = "Seleccioná una opción";
    }
    if (step === 1) {
      if (!anamnesis.motivoConsulta.trim()) errs.motivoConsulta = "Completá el motivo de consulta";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setErrors({});
    if (step < totalSections - 1) {
      setStep(s => s + 1);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
      setShowConfirm(true);
    }
  };

  const goBack = () => {
    setErrors({});
    if (step > 0) { setStep(s => s - 1); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }
    else onVolver?.();
  };

  // ─── SECCIÓN 0: DATOS PERSONALES ─────────────────────────────────────────
  const renderPersonal = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard icon="◎" title="Datos personales" subtitle="Información de identificación del paciente">
        <Grid cols={2} gap={16}>
          <Input label="Nombre" required value={personal.nombre} onChange={e => setPersonal({...personal, nombre: e.target.value})} error={errors.nombre} placeholder="María" />
          <Input label="Apellido" required value={personal.apellido} onChange={e => setPersonal({...personal, apellido: e.target.value})} error={errors.apellido} placeholder="García" />
          <Input label="DNI" required value={personal.dni}
            onChange={e => setPersonal({...personal, dni: formatDNI(e.target.value)})}
            error={errors.dni} placeholder="XX.XXX.XXX" hint="Sin puntos ni espacios" />
          <Input label="Fecha de nacimiento" required type="date" value={personal.fechaNac} onChange={e => setPersonal({...personal, fechaNac: e.target.value})} error={errors.fechaNac} hint={edad ? `Edad calculada: ${edad} años` : ""} />
          <RadioGroup label="Sexo biológico (para cálculos)" required options={["Femenino","Masculino","Otro"]} value={personal.sexo} onChange={v => { setPersonal({...personal, sexo: v}); if(errors.sexo) setErrors({...errors, sexo: ""}); }} />
          <Select label="Tipo de consulta" required options={TIPO_CONSULTA} value={personal.tipoConsulta} onChange={e => setPersonal({...personal, tipoConsulta: e.target.value})} />
          <Input label="Provincia" value={personal.provincia} onChange={e => setPersonal({...personal, provincia: e.target.value})} placeholder="Buenos Aires" />
          <Input label="Localidad" value={personal.localidad} onChange={e => setPersonal({...personal, localidad: e.target.value})} placeholder="Capital Federal" />
          <Input label="Email" type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} placeholder="mail@ejemplo.com" />
          <Input label="Teléfono / WhatsApp" value={personal.telefono} onChange={e => setPersonal({...personal, telefono: e.target.value})} placeholder="+54 11 XXXX-XXXX" />
        </Grid>
        <div style={{ marginTop: 20 }}>
          <Divider label="Aspectos personales" />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <Textarea label="Autopercepción de imagen corporal" value={personal.autopercepcion} onChange={e => setPersonal({...personal, autopercepcion: e.target.value})} rows={2} hint="¿Cómo se ve y se siente con su cuerpo?" />
            <Grid cols={2} gap={16}>
              <Toggle label="¿Asistencia psicológica?" sub="Actual o pasada" value={personal.asistenciaPsi} onChange={v => setPersonal({...personal, asistenciaPsi: v})} />
              {personal.asistenciaPsi && (
                <Input label="Frecuencia" value={personal.frecPsi} onChange={e => setPersonal({...personal, frecPsi: e.target.value})} placeholder="Ej: semanal" />
              )}
            </Grid>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  // ─── SECCIÓN 1: ANTECEDENTES ──────────────────────────────────────────────
  const renderAntecedentes = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard icon="◉" title="Cuestionario nutricional" subtitle="Historial alimentario y motivo de consulta">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Textarea label="¿Primera vez en el área? Experiencia previa" value={anamnesis.primeraVez} onChange={e => setAnamnesis({...anamnesis, primeraVez: e.target.value})} rows={2} hint="Describí experiencias anteriores con nutricionistas u otras dietas" />
          <Textarea label="Motivo de la consulta" required value={anamnesis.motivoConsulta} onChange={e => { setAnamnesis({...anamnesis, motivoConsulta: e.target.value}); if(errors.motivoConsulta) setErrors({...errors, motivoConsulta: ""}); }} rows={4} hint="Describí el objetivo principal y lo que llevó al paciente a consultar" />
          {errors.motivoConsulta && <span style={{ fontSize: 10, color: "#D85A30", marginTop: -10 }}>{errors.motivoConsulta}</span>}
          <Grid cols={2} gap={16}>
            <Textarea label="Ocupación / Horarios / Comida en el trabajo" value={anamnesis.ocupacion} onChange={e => setAnamnesis({...anamnesis, ocupacion: e.target.value})} rows={3} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="¿Vive solo/a o acompañado/a? ¿Quién cocina?" value={anamnesis.viveSolo} onChange={e => setAnamnesis({...anamnesis, viveSolo: e.target.value})} placeholder="Ej: Vive con pareja, cocina ella" />
              <div>
                <Toggle label="¿Sale a comer afuera?" value={anamnesis.saleComerAfuera} onChange={v => setAnamnesis({...anamnesis, saleComerAfuera: v})} />
                {anamnesis.saleComerAfuera && (
                  <Input style={{ marginTop: 8 }} placeholder="Frecuencia (ej: 2x por semana)" value={anamnesis.frecSalidas} onChange={e => setAnamnesis({...anamnesis, frecSalidas: e.target.value})} />
                )}
              </div>
            </div>
          </Grid>
          <Select label="Patrón alimentario" options={PATRON_ALI} value={anamnesis.patronAlimentario} onChange={e => setAnamnesis({...anamnesis, patronAlimentario: e.target.value})} />
          <Textarea label="Alergias y/o intolerancias alimentarias" value={anamnesis.alergias} onChange={e => setAnamnesis({...anamnesis, alergias: e.target.value})} rows={2} hint="Indicá si son diagnosticadas o autoreportadas" />
          <Textarea label="Medicación y/o suplementación actual" value={anamnesis.medicacion} onChange={e => setAnamnesis({...anamnesis, medicacion: e.target.value})} rows={2} />
          <Textarea label="Laboratorio (fecha / resultados relevantes)" value={anamnesis.laboratorio} onChange={e => setAnamnesis({...anamnesis, laboratorio: e.target.value})} rows={3} hint="Glucemia, perfil lipídico, hemograma, TSH, vitamina D, B12, ferritina, etc." />
        </div>
      </SectionCard>

      <SectionCard icon="🩺" title="Antecedentes clínicos" subtitle="Personal / Familiar / Medicación asociada">
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 1fr", gap: 8, padding: "6px 0 10px", borderBottom: "2px solid #E8E6DF" }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Condición</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Personal</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Familiar</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Medicación</span>
          </div>
          {ANTECEDENTES_LIST.map(enf => (
            <AntecRow key={enf} enf={enf} data={antecedentes[enf]} onChange={v => setAntecedentes({...antecedentes, [enf]: v})} />
          ))}
        </div>
      </SectionCard>
    </div>
  );

  // ─── SECCIÓN 2: ESTILO DE VIDA ─────────────────────────────────────────────
  const renderEstilo = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard icon="◐" title="Actividad física" subtitle="Tipo, frecuencia y relación con el ejercicio">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RadioGroup label="Nivel de actividad física" options={ACTIVIDAD_TIPO} value={estilo.actividadFisica} onChange={v => setEstilo({...estilo, actividadFisica: v})} />
          <Grid cols={2} gap={16}>
            <Input label="Tipo de actividad y duración" value={estilo.tipoActividad} onChange={e => setEstilo({...estilo, tipoActividad: e.target.value})} placeholder="Ej: natación 45 min" />
            <Input label="Días y horarios de ejercicio" value={estilo.frecActividad} onChange={e => setEstilo({...estilo, frecActividad: e.target.value})} placeholder="Ej: Lun/Mié/Vie 7am" />
            <Input label="Comidas pre/post entrenamiento" value={estilo.comidasPrePost} onChange={e => setEstilo({...estilo, comidasPrePost: e.target.value})} placeholder="¿Qué consume antes y después?" />
            <Input label="Hidratación durante ejercicio" value={estilo.hidratacion} onChange={e => setEstilo({...estilo, hidratacion: e.target.value})} placeholder="Ej: 500ml agua, sin rehidratantes" />
          </Grid>
          <Toggle label="¿Le gusta hacer ejercicio?" sub="Motivación hacia la actividad física" value={estilo.gustoEjercicio} onChange={v => setEstilo({...estilo, gustoEjercicio: v})} />
          <Textarea label="Observaciones adicionales sobre actividad física" value={estilo.observaciones} onChange={e => setEstilo({...estilo, observaciones: e.target.value})} rows={2} />
        </div>
      </SectionCard>
    </div>
  );

  // ─── SECCIÓN 3: CUESTIONARIO NUTRICIONAL ──────────────────────────────────
  const renderNutricional = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard icon="◑" title="Recordatorio 24hs" subtitle="Consumo habitual del día anterior o típico">
        <Grid cols={2} gap={14}>
          {[
            ["Desayuno", "desayuno"],["Colación media mañana","colMañana"],
            ["Almuerzo","almuerzo"],["Merienda","merienda"],
            ["Colación media tarde","colTarde"],["Cena","cena"],
            ["Postres / dulces / picoteo","postres"],["Bebidas (agua, gaseosas, jugos, alcohol)","bebidas"],
          ].map(([lbl, key]) => (
            <Textarea key={key} label={lbl} value={nutricional[key]} onChange={e => setNutricional({...nutricional, [key]: e.target.value})} rows={2} placeholder="Describí los alimentos y cantidades…" />
          ))}
        </Grid>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <Divider label="Hábitos de alimentación" />
          <Grid cols={2} gap={14}>
            <Input label="Cantidad de comidas al día" value={nutricional.cantComidas} onChange={e => setNutricional({...nutricional, cantComidas: e.target.value})} placeholder="Ej: 4 comidas + 1 colación" />
            <Input label="Duración de las comidas / masticación" value={nutricional.duracion} onChange={e => setNutricional({...nutricional, duracion: e.target.value})} placeholder="Ej: come rápido, 10 min" />
          </Grid>
          <Grid cols={2} gap={14}>
            <RadioGroup label="Apetito" options={["Alto","Regular","Bajo"]} value={nutricional.apetito} onChange={v => setNutricional({...nutricional, apetito: v})} />
          </Grid>
          <Textarea label="Hambre y saciedad: ¿Come aunque ya esté saciado/a?" value={nutricional.hambreSaciedad} onChange={e => setNutricional({...nutricional, hambreSaciedad: e.target.value})} rows={2} />
          <Textarea label="Estilos de comida que le gustan" value={nutricional.estilosComida} onChange={e => setNutricional({...nutricional, estilosComida: e.target.value})} rows={2} hint="Ej: tartas, empanadas, wok, ensaladas frías, milanesas, etc." />
        </div>
      </SectionCard>

      <SectionCard icon="◒" title="Frecuencia de consumo de alimentos" subtitle="Marcá si consume cada alimento y con qué frecuencia">
        {[
          ["Hidratos de carbono", HABITOS_HC, "habitosHC"],
          ["Proteínas y lácteos", HABITOS_PROT, "habitosProt"],
          ["Frutas y verduras", HABITOS_FYVERD, "habitosFyV"],
          ["Grasas saludables", HABITOS_GRASAS, "habitosGrasas"],
          ["Otros alimentos", HABITOS_OTROS, "habitosOtros"],
        ].map(([titulo, lista, key]) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <Divider label={titulo} />
            <div style={{ marginTop: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 160px", gap: 8, padding: "4px 0 8px", borderBottom: "1px solid #E8E6DF" }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Alimento</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>¿Consume?</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.04em" }}>Frecuencia</span>
              </div>
              {lista.map(alimento => (
                <HabitoRow key={alimento} alimento={alimento} data={nutricional[key][alimento]} onChange={v => setNutricional({...nutricional, [key]: {...nutricional[key], [alimento]: v}})} />
              ))}
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );

  const renderSection = () => {
    switch(step) {
      case 0: return renderPersonal();
      case 1: return renderAntecedentes();
      case 2: return renderEstilo();
      case 3: return renderNutricional();
      default: return null;
    }
  };

  const nombreCompleto = `${personal.nombre} ${personal.apellido}`.trim() || "el paciente";

  return (
    <div ref={topRef} style={{ fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", background: "#F5F4F0", minHeight: "100vh", color: "#2C2C2A" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6DF", padding: "0 28px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={goBack} style={{ background: "none", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          ← Volver
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>
            Historia Clínica Nutricional
            {personal.nombre && <span style={{ color: "#B4B2A9", fontWeight: 400 }}> — {nombreCompleto}</span>}
          </div>
          <ProgressBar current={step + 1} total={totalSections} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 11,
              color: i < step ? "#1D9E75" : i === step ? "#0F6E56" : "#B4B2A9",
              fontWeight: i === step ? 500 : 400,
              cursor: i < step ? "pointer" : "default",
            }} onClick={() => i < step && setStep(i)}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: i < step ? "#1D9E75" : i === step ? "#E1F5EE" : "#F1F0EA", color: i < step ? "#fff" : i === step ? "#0F6E56" : "#B4B2A9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600 }}>
                {i < step ? "✓" : i + 1}
              </span>
              <span style={{ display: "none" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#B4B2A9" }}>
          {step + 1} / {totalSections}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F0EA", padding: "10px 28px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "#B4B2A9" }}>Dashboard</span>
        <span style={{ fontSize: 11, color: "#D3D1C7" }}>/</span>
        <span style={{ fontSize: 11, color: "#B4B2A9" }}>Nuevo ingreso</span>
        <span style={{ fontSize: 11, color: "#D3D1C7" }}>/</span>
        <span style={{ fontSize: 11, color: "#0F6E56", fontWeight: 500 }}>{SECTIONS[step].label}</span>
      </div>

      {/* Stepper lateral + contenido */}
      <div style={{ display: "flex", padding: "28px", gap: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* Stepper vertical */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map((s, i) => (
              <button key={s.id} onClick={() => i < step && setStep(i)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: i === step ? "#E1F5EE" : "transparent",
                cursor: i <= step ? "pointer" : "default",
                textAlign: "left", fontFamily: "inherit", transition: "background 0.12s",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                  background: i < step ? "#1D9E75" : i === step ? "#1D9E75" : "#F1F0EA",
                  color: i <= step ? "#fff" : "#B4B2A9",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: i === step ? 500 : 400, color: i === step ? "#0F6E56" : i < step ? "#2C2C2A" : "#B4B2A9" }}>{s.label}</div>
                  {i === step && <div style={{ fontSize: 10, color: "#1D9E75", marginTop: 1 }}>En curso</div>}
                  {i < step && <div style={{ fontSize: 10, color: "#1D9E75", marginTop: 1 }}>Completado ✓</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {renderSection()}

          {/* Navegación */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
            <button onClick={goBack} style={{ padding: "10px 20px", border: "1.5px solid #E8E6DF", borderRadius: 10, background: "#fff", fontSize: 13, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>
              {step === 0 ? "← Cancelar" : "← Anterior"}
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => {}} style={{ padding: "10px 20px", border: "1.5px solid #E8E6DF", borderRadius: 10, background: "#fff", fontSize: 13, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>
                Guardar borrador
              </button>
              <button onClick={goNext} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: "#1D9E75", fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                {step < totalSections - 1 ? `Siguiente: ${SECTIONS[step + 1].label} →` : "Finalizar y guardar ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && <ConfirmModal nombre={nombreCompleto} onConfirm={() => { setShowConfirm(false); onIrAntropometria?.(); }} onBack={() => setShowConfirm(false)} />}
    </div>
  );
}
