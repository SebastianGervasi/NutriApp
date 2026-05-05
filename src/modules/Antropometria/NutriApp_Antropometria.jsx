import { useState, useMemo } from "react";

// ─── CONSTANTES DE VALIDACIÓN (rangos ISAK / valores fisiológicos esperados) ──
const RANGES = {
  peso:          { min: 30,   max: 250,  unit: "kg",  label: "Peso" },
  talla:         { min: 130,  max: 220,  unit: "cm",  label: "Talla" },
  tallaSentado:  { min: 60,   max: 120,  unit: "cm",  label: "Talla sentado" },
  envergadura:   { min: 130,  max: 230,  unit: "cm",  label: "Envergadura" },
  plTriceps:     { min: 2,    max: 60,   unit: "mm",  label: "Pliegue tríceps" },
  plSubescapular:{ min: 2,    max: 60,   unit: "mm",  label: "Pliegue subescapular" },
  plBiceps:      { min: 2,    max: 40,   unit: "mm",  label: "Pliegue bíceps" },
  plCrestaIliaca:{ min: 2,    max: 70,   unit: "mm",  label: "Cresta ilíaca" },
  plSupraespinal:{ min: 2,    max: 60,   unit: "mm",  label: "Pliegue supraespinal" },
  plAbdominal:   { min: 2,    max: 70,   unit: "mm",  label: "Pliegue abdominal" },
  plMuslo:       { min: 2,    max: 70,   unit: "mm",  label: "Pliegue muslo" },
  plPierna:      { min: 2,    max: 50,   unit: "mm",  label: "Pliegue pierna" },
  prBrazoRel:    { min: 15,   max: 55,   unit: "cm",  label: "Perímetro brazo relajado" },
  prBrazoFlex:   { min: 20,   max: 60,   unit: "cm",  label: "Perímetro brazo flex." },
  prCintura:     { min: 50,   max: 160,  unit: "cm",  label: "Perímetro cintura" },
  prCadera:      { min: 60,   max: 180,  unit: "cm",  label: "Perímetro cadera" },
  prAntebrazo:   { min: 15,   max: 40,   unit: "cm",  label: "Perímetro antebrazo" },
  prTorax:       { min: 60,   max: 150,  unit: "cm",  label: "Perímetro tórax" },
  prMuslo:       { min: 30,   max: 90,   unit: "cm",  label: "Perímetro muslo" },
  prPierna:      { min: 20,   max: 60,   unit: "cm",  label: "Perímetro pierna" },
  dHumeral:      { min: 4,    max: 9,    unit: "cm",  label: "Diámetro humeral" },
  dBiestiloideo: { min: 4,    max: 7,    unit: "cm",  label: "Diámetro biestiloideo" },
  dFemur:        { min: 7,    max: 12,   unit: "cm",  label: "Diámetro fémur" },
  dBiacromial:   { min: 30,   max: 50,   unit: "cm",  label: "Diámetro biacromial" },
};

// ─── FÓRMULAS ────────────────────────────────────────────────────────────────

// IMC
const calcIMC = (peso, talla) => peso / ((talla / 100) ** 2);

// Σ6 pliegues (Yuhasz: tríceps, subescapular, supraespinal, abdominal, muslo, pierna)
const calcSuma6 = (d) =>
  (d.plTriceps + d.plSubescapular + d.plSupraespinal +
   d.plAbdominal + d.plMuslo + d.plPierna) || 0;

// Σ4 pliegues (Durnin-Womersley: bíceps, tríceps, subescapular, cresta ilíaca)
const calcSuma4 = (d) =>
  (d.plBiceps + d.plTriceps + d.plSubescapular + d.plCrestaIliaca) || 0;

// % Grasa — Durnin-Womersley (1974), según sexo y edad
const calcPctGrasa = (suma4, sexo, edad) => {
  if (!suma4 || !edad) return null;
  const logS = Math.log10(suma4);
  let densidad;
  if (sexo === "M") {
    if (edad < 17)       densidad = 1.1533 - 0.0643 * logS;
    else if (edad < 20)  densidad = 1.1620 - 0.0630 * logS;
    else if (edad < 30)  densidad = 1.1631 - 0.0632 * logS;
    else if (edad < 40)  densidad = 1.1422 - 0.0544 * logS;
    else if (edad < 50)  densidad = 1.1620 - 0.0700 * logS;
    else                 densidad = 1.1715 - 0.0779 * logS;
  } else {
    if (edad < 17)       densidad = 1.1369 - 0.0598 * logS;
    else if (edad < 20)  densidad = 1.1549 - 0.0678 * logS;
    else if (edad < 30)  densidad = 1.1599 - 0.0717 * logS;
    else if (edad < 40)  densidad = 1.1423 - 0.0632 * logS;
    else if (edad < 50)  densidad = 1.1333 - 0.0612 * logS;
    else                 densidad = 1.1339 - 0.0645 * logS;
  }
  return ((4.95 / densidad) - 4.50) * 100;
};

// ─── 5 COMPONENTES: ROSS & KERR (1993) ───────────────────────────────────────
const calc5Componentes = (d, sexo, edad) => {
  const { peso, talla, plTriceps, plSubescapular, plSupraespinal, plAbdominal, plMuslo, plPierna,
          plBiceps, plCrestaIliaca,
          prBrazoFlex, prCintura, prPierna: prPierna2, prMuslo,
          dHumeral, dBiestiloideo, dFemur, dBiacromial } = d;

  if (!peso || !talla) return null;

  const h  = talla / 100;        // en metros
  const h2 = h * h;
  const h3 = h2 * h;
  const s6 = calcSuma6(d);
  const s4 = calcSuma4(d);

  // ── MASA ÓSEA (Rocha, 1975) ──
  const masaOsea = 3.02 * ((h2 * dHumeral * dFemur * 400) ** 0.712);

  // ── MASA RESIDUAL (Würch, 1974) ──
  const masaResidual = sexo === "M"
    ? peso * 0.241
    : peso * 0.209;

  // ── MASA GRASA ── (Durnin-Womersley, como base)
  const pctG = calcPctGrasa(s4, sexo, edad) || 0;
  const masaGrasa = peso * pctG / 100;

  // ── MASA PIEL (Clarys & Marfell-Jones, 1986) ──
  // Fórmula de superficie corporal (Mosteller): √(talla * peso / 3600)
  const sc = Math.sqrt((talla * peso) / 3600);
  const masaPiel = sc * 2.51;

  // ── MASA MUSCULAR ── (resto)
  const masaMuscular = peso - (masaGrasa + masaOsea + masaResidual + masaPiel);

  const total = masaGrasa + masaMuscular + masaOsea + masaResidual + masaPiel;

  return {
    masaGrasa:     Math.max(0, masaGrasa),
    masaMuscular:  Math.max(0, masaMuscular),
    masaOsea:      Math.max(0, masaOsea),
    masaResidual:  Math.max(0, masaResidual),
    masaPiel:      Math.max(0, masaPiel),
    pctGrasa:      (masaGrasa / peso) * 100,
    pctMuscular:   (Math.max(0, masaMuscular) / peso) * 100,
    pctOsea:       (masaOsea / peso) * 100,
    pctResidual:   (masaResidual / peso) * 100,
    pctPiel:       (masaPiel / peso) * 100,
    indiceMO:      masaMuscular / masaOsea,        // índice músculo/óseo
    indiceGM:      masaGrasa / Math.max(0.1, masaMuscular),  // índice grasa/músculo
  };
};

// ─── SOMATOTIPO: HEATH-CARTER (1990) ─────────────────────────────────────────
const calcSomatotipo = (d, sexo) => {
  const { peso, talla, plTriceps, plSubescapular, plSupraespinal, plAbdominal, plMuslo, plPierna,
          prBrazoFlex, prPierna: prPierna2,
          dHumeral, dFemur } = d;

  if (!peso || !talla || !plTriceps) return null;

  // ── ENDOMORFIA (escala 1-7+) ──
  const sumEndo = plTriceps + plSubescapular + plSupraespinal;
  const sumCorr = sumEndo * (170.18 / talla);
  const endo = -0.7182 + 0.1451 * sumCorr - 0.00068 * sumCorr ** 2 + 0.0000014 * sumCorr ** 3;

  // ── MESOMORFIA ──
  const brachioCirc = prBrazoFlex - (plTriceps / 10);
  const calfCirc    = prPierna2  - (plPierna  / 10);
  const meso = 0.858 * dHumeral + 0.601 * dFemur
             + 0.188 * brachioCirc + 0.161 * calfCirc
             - 0.131 * talla + 4.50;

  // ── ECTOMORFIA ──
  const ipc = talla / (peso ** (1 / 3));   // índice ponderal
  let ecto;
  if      (ipc >= 40.75)                 ecto = 0.732 * ipc - 28.58;
  else if (ipc >= 38.25 && ipc < 40.75) ecto = 0.463 * ipc - 17.63;
  else                                   ecto = 0.1;

  return {
    endo: Math.max(0.1, endo),
    meso: Math.max(0.1, meso),
    ecto: Math.max(0.1, ecto),
  };
};

// ─── COORDENADAS SOMATOCARTA ─────────────────────────────────────────────────
// X = ecto − endo;  Y = 2 × meso − (endo + ecto)
const somaCoords = (s) => ({
  x: s.ecto - s.endo,
  y: 2 * s.meso - (s.endo + s.ecto),
});

// ─── DATOS DE LA CONSULTA ANTERIOR (para comparación) ────────────────────────
const CONSULTA_ANTERIOR = {
  fecha: "14/04/2025", peso: 63.1, talla: 159,
  plTriceps: 14, plSubescapular: 11, plBiceps: 7, plCrestaIliaca: 15,
  plSupraespinal: 12, plAbdominal: 18, plMuslo: 22, plPierna: 14,
  prBrazoRel: 27.2, prBrazoFlex: 29.0, prCintura: 82, prCadera: 97,
  prAntebrazo: 22.1, prTorax: 85, prMuslo: 52, prPierna: 35,
  dHumeral: 5.8, dBiestiloideo: 5.0, dFemur: 8.2, dBiacromial: 36,
  tallaSentado: 84, envergadura: 162,
};

// ─── ESTADO INICIAL VACÍO ────────────────────────────────────────────────────
const EMPTY = {
  peso: "", talla: "", tallaSentado: "", envergadura: "",
  plTriceps: "", plSubescapular: "", plBiceps: "", plCrestaIliaca: "",
  plSupraespinal: "", plAbdominal: "", plMuslo: "", plPierna: "",
  prBrazoRel: "", prBrazoFlex: "", prCintura: "", prCadera: "",
  prAntebrazo: "", prTorax: "", prMuslo: "", prPierna: "",
  dHumeral: "", dBiestiloideo: "", dFemur: "", dBiacromial: "",
};

const PACIENTE_META = { nombre: "Sofía Castillo", sexo: "F", edad: 41, fecha: "28/04/2025" };

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
function Pill({ label, bg, color }) {
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 500 }}>{label}</span>;
}
function Label({ text, required }) {
  return <label style={{ fontSize: 11, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 4 }}>
    {text}{required && <span style={{ color: "#D85A30", marginLeft: 2 }}>*</span>}
  </label>;
}
function Divider({ label }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
    <div style={{ flex: 1, height: 1, background: "#F1F0EA" }} />
    <span style={{ fontSize: 10, color: "#B4B2A9", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: "#F1F0EA" }} />
  </div>;
}

// ─── CAMPO NUMÉRICO CON VALIDACIÓN ───────────────────────────────────────────
function NumField({ fieldKey, value, onChange, warn, error }) {
  const [focused, setFocused] = useState(false);
  const range = RANGES[fieldKey];
  const borderColor = error ? "#D85A30" : warn ? "#EF9F27" : focused ? "#1D9E75" : "#E8E6DF";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Label text={`${range?.label || fieldKey} (${range?.unit || ""})`} />
      <div style={{ position: "relative" }}>
        <input
          type="number" value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={range ? `${range.min}–${range.max}` : ""}
          style={{
            width: "100%", padding: "8px 10px", border: `1.5px solid ${borderColor}`,
            borderRadius: 9, fontSize: 13, color: "#2C2C2A", background: "#fff",
            outline: "none", fontFamily: "inherit", transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
        />
        {(warn || error) && (
          <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>
            {error ? "⚠" : "⚡"}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 9, color: "#D85A30" }}>{error}</span>}
      {warn && !error && <span style={{ fontSize: 9, color: "#EF9F27" }}>{warn}</span>}
    </div>
  );
}

// ─── CARD DE COMPONENTE ───────────────────────────────────────────────────────
function ComponentBar({ label, kg, pct, color, prevKg }) {
  const diff = prevKg !== undefined ? (kg - prevKg).toFixed(1) : null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#2C2C2A" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {diff !== null && (
            <span style={{ fontSize: 10, color: parseFloat(diff) < 0 ? "#1D9E75" : "#D85A30", fontWeight: 500 }}>
              {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{kg.toFixed(2)} kg</span>
          <span style={{ fontSize: 11, color: "#B4B2A9" }}>({pct.toFixed(1)}%)</span>
        </div>
      </div>
      <div style={{ height: 6, background: "#F1F0EA", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, pct * 2)}%`, background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── SOMATOCARTA SVG ─────────────────────────────────────────────────────────
function Somatocarta({ soma, somaAnterior }) {
  const W = 320, H = 300, cx = W / 2, cy = H / 2 + 20;
  const scale = 28;

  const toSVG = (x, y) => ({ sx: cx + x * scale, sy: cy - y * scale });

  const coords = soma ? somaCoords(soma) : null;
  const coordsAnt = somaAnterior ? somaCoords(somaAnterior) : null;

  // Etiquetas de zona somatotípica
  const ZONES = [
    { label: "ENDO puro", x: 0, y: -3.3 },
    { label: "MESO puro", x: 0, y: 4 },
    { label: "ECTO puro", x: 0, y: -1.5 },
    { label: "ENDO-MESO", x: -2, y: 1 },
    { label: "ECTO-MESO", x: 2, y: 1 },
    { label: "ENDO-ECTO", x: -2, y: -2 },
    { label: "MESO-ECTO", x: 2, y: -2 },
  ];

  // Grilla de fondo
  const gridLines = [];
  for (let v = -8; v <= 8; v++) {
    gridLines.push(
      <line key={`h${v}`} x1={0} y1={cy - v * scale} x2={W} y2={cy - v * scale} stroke="#F1F0EA" strokeWidth={v === 0 ? 1.5 : 0.5} />,
      <line key={`v${v}`} x1={cx + v * scale} y1={0} x2={cx + v * scale} y2={H} stroke="#F1F0EA" strokeWidth={v === 0 ? 1.5 : 0.5} />
    );
  }

  // Círculos concéntricos
  const circles = [2, 4, 6].map(r => (
    <ellipse key={r} cx={cx} cy={cy} rx={r * scale} ry={r * scale * 0.65} fill="none" stroke="#F1F0EA" strokeWidth={0.5} strokeDasharray="3 3" />
  ));

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {gridLines}
        {circles}
        {/* Ejes */}
        <line x1={cx} y1={10} x2={cx} y2={H - 10} stroke="#D3D1C7" strokeWidth={1} />
        <line x1={10} y1={cy} x2={W - 10} y2={cy} stroke="#D3D1C7" strokeWidth={1} />
        {/* Etiquetas eje */}
        <text x={cx + 2} y={H - 8} fontSize={8} fill="#B4B2A9" textAnchor="middle">+Ecto</text>
        <text x={cx + 2} y={14} fontSize={8} fill="#B4B2A9" textAnchor="middle">+Meso</text>
        <text x={14} y={cy + 3} fontSize={8} fill="#B4B2A9">−</text>
        <text x={W - 14} y={cy + 3} fontSize={8} fill="#B4B2A9" textAnchor="end">+</text>
        <text x={cx + 2} y={cy + 14} fontSize={7} fill="#B4B2A9" textAnchor="middle">+Endo ←        → +Ecto</text>

        {/* Punto anterior */}
        {coordsAnt && (() => {
          const { sx, sy } = toSVG(coordsAnt.x, coordsAnt.y);
          return (
            <g>
              <circle cx={sx} cy={sy} r={7} fill="#E8E6DF" stroke="#B4B2A9" strokeWidth={1.5} />
              <text x={sx + 10} y={sy - 6} fontSize={8} fill="#B4B2A9">Ant.</text>
            </g>
          );
        })()}

        {/* Línea de evolución */}
        {coords && coordsAnt && (() => {
          const p1 = toSVG(coordsAnt.x, coordsAnt.y);
          const p2 = toSVG(coords.x, coords.y);
          return <line x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke="#1D9E75" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />;
        })()}

        {/* Punto actual */}
        {coords && (() => {
          const { sx, sy } = toSVG(coords.x, coords.y);
          return (
            <g>
              <circle cx={sx} cy={sy} r={10} fill="#E1F5EE" stroke="#1D9E75" strokeWidth={2} />
              <circle cx={sx} cy={sy} r={4} fill="#1D9E75" />
              <text x={sx + 13} y={sy - 8} fontSize={8} fill="#0F6E56" fontWeight="bold">Actual</text>
              <text x={sx + 13} y={sy + 2} fontSize={7} fill="#1D9E75">
                {`${soma.endo.toFixed(1)}-${soma.meso.toFixed(1)}-${soma.ecto.toFixed(1)}`}
              </text>
            </g>
          );
        })()}

        {/* Leyenda de zonas */}
        {!coords && (
          <text x={cx} y={cy} fontSize={10} fill="#D3D1C7" textAnchor="middle">Ingresá datos para ver el punto</text>
        )}
      </svg>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#E1F5EE", border: "2px solid #1D9E75" }} />
          Consulta actual
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#E8E6DF", border: "1.5px solid #B4B2A9" }} />
          Consulta anterior
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#5F5E5A" }}>
          <div style={{ width: 16, height: 2, background: "#1D9E75", borderRadius: 1 }} />
          Evolución
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NutriAntropometria({ onVolver }) {
  const [data, setData]     = useState(EMPTY);
  const [sexo, setSexo]     = useState(PACIENTE_META.sexo);   // M / F
  const [saved, setSaved]   = useState(false);

  // Validar cada campo
  const validaciones = useMemo(() => {
    const warns = {}, errors = {};
    Object.entries(data).forEach(([k, v]) => {
      if (!v || v === "") return;
      const n = parseFloat(v);
      const r = RANGES[k];
      if (!r) return;
      if (n < r.min || n > r.max) {
        // Detección de error de unidad: pliegue en cm en vez de mm
        if (k.startsWith("pl") && n < 2 && n > 0) {
          errors[k] = `¿En cm? Los pliegues van en mm (ej: ${n} cm = ${(n*10).toFixed(0)} mm)`;
        } else {
          errors[k] = `Fuera de rango (${r.min}–${r.max} ${r.unit})`;
        }
      } else if (n > r.max * 0.9) {
        warns[k] = `Valor alto, verificar`;
      }
    });
    return { warns, errors };
  }, [data]);

  // Convertir a números
  const num = useMemo(() => {
    const n = {};
    Object.entries(data).forEach(([k, v]) => { n[k] = parseFloat(v) || 0; });
    return n;
  }, [data]);

  const imc = useMemo(() => num.peso && num.talla ? calcIMC(num.peso, num.talla) : null, [num]);
  const suma6 = useMemo(() => calcSuma6(num), [num]);
  const suma4 = useMemo(() => calcSuma4(num), [num]);

  const comp5 = useMemo(() => {
    if (!num.peso || !num.talla || !num.dHumeral || !num.dFemur) return null;
    return calc5Componentes(num, sexo, PACIENTE_META.edad);
  }, [num, sexo]);

  const soma = useMemo(() => {
    if (!num.peso || !num.talla || !num.plTriceps || !num.prBrazoFlex || !num.dHumeral || !num.dFemur) return null;
    return calcSomatotipo(num, sexo);
  }, [num, sexo]);

  const somaAnterior = useMemo(() => calcSomatotipo(CONSULTA_ANTERIOR, "F"), []);

  // Comp5 anterior (para deltas)
  const comp5Ant = useMemo(() => calc5Componentes(CONSULTA_ANTERIOR, "F", 41), []);

  const onChange = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const completitudPct = useMemo(() => {
    const total = Object.keys(EMPTY).length;
    const llenos = Object.values(data).filter(v => v !== "").length;
    return Math.round((llenos / total) * 100);
  }, [data]);

  const tieneErrores = Object.keys(validaciones.errors).length > 0;

  const COMP_COLORS = {
    masaGrasa: "#D85A30", masaMuscular: "#1D9E75",
    masaOsea: "#378ADD", masaResidual: "#EF9F27", masaPiel: "#B4B2A9",
  };
  const COMP_LABELS = {
    masaGrasa: "Masa grasa", masaMuscular: "Masa muscular",
    masaOsea: "Masa ósea", masaResidual: "Masa residual", masaPiel: "Masa piel",
  };

  // Categoría IMC
  const imcCat = imc
    ? imc < 18.5 ? { label: "Bajo peso", bg: "#E6F1FB", color: "#0C447C" }
    : imc < 25   ? { label: "Normopeso",  bg: "#E1F5EE", color: "#0F6E56" }
    : imc < 30   ? { label: "Sobrepeso",  bg: "#FAEEDA", color: "#633806" }
    : { label: "Obesidad", bg: "#FAECE7", color: "#712B13" }
    : null;

  // Tipo somatotípico
  const somaTipo = soma ? (() => {
    const { endo, meso, ecto } = soma;
    const max = Math.max(endo, meso, ecto);
    const dif = Math.abs;
    if (max === meso && Math.abs(endo - ecto) <= 1) return "Meso equilibrado";
    if (max === meso && endo > ecto + 1) return "Endo-Mesomorfo";
    if (max === meso && ecto > endo + 1) return "Meso-Ectomorfo";
    if (max === endo && meso > ecto + 1) return "Endo-Mesomorfo";
    if (max === endo) return "Endomórfico";
    if (max === ecto && meso > endo + 1) return "Meso-Ectomorfo";
    if (max === ecto) return "Ectomórfico";
    return "Central";
  })() : null;

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", background: "#F5F4F0", minHeight: "100vh", color: "#2C2C2A" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6DF", padding: "0 22px", height: 58, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onVolver} style={{ background: "none", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>← Volver</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Valoración Antropométrica — {PACIENTE_META.nombre}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <div style={{ height: 3, width: 120, background: "#F1F0EA", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completitudPct}%`, background: "#1D9E75", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 10, color: "#B4B2A9" }}>{completitudPct}% completado</span>
          </div>
        </div>
        {tieneErrores && <Pill label={`${Object.keys(validaciones.errors).length} error(es)`} bg="#FAECE7" color="#712B13" />}
        <Pill label={`Consulta ${PACIENTE_META.fecha}`} bg="#E1F5EE" color="#0F6E56" />
        <button
          onClick={() => !tieneErrores && setSaved(true)}
          disabled={tieneErrores}
          style={{ background: tieneErrores ? "#F1F0EA" : "#1D9E75", color: tieneErrores ? "#B4B2A9" : "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 500, cursor: tieneErrores ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          Guardar valoración
        </button>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F0EA", padding: "8px 22px", display: "flex", gap: 5, fontSize: 11 }}>
        <span style={{ color: "#B4B2A9" }}>Dashboard</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#B4B2A9" }}>{PACIENTE_META.nombre}</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#0F6E56", fontWeight: 500 }}>Antropometría ISAK Nivel 2</span>
      </div>

      {/* Layout */}
      <div style={{ display: "flex", padding: "20px", gap: 18, maxWidth: 1200, margin: "0 auto" }}>

        {/* ─── FORMULARIO IZQUIERDO ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* Sexo selector */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Parámetros del cálculo</div>
              <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>El sexo biológico afecta las fórmulas de composición y somatotipo</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["F","Femenino"],["M","Masculino"]].map(([s, l]) => (
                <button key={s} onClick={() => setSexo(s)} style={{
                  padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
                  borderColor: sexo === s ? "#1D9E75" : "#E8E6DF",
                  background: sexo === s ? "#E1F5EE" : "#fff",
                  color: sexo === s ? "#0F6E56" : "#5F5E5A",
                  fontWeight: sexo === s ? 500 : 400,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit"
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Medidas básicas */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬛</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Medidas básicas</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {["peso","talla","tallaSentado","envergadura"].map(k => (
                <NumField key={k} fieldKey={k} value={data[k]} onChange={onChange}
                  warn={validaciones.warns[k]} error={validaciones.errors[k]} />
              ))}
            </div>
            {imc && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#F5F4F0", borderRadius: 10, display: "flex", gap: 20, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 10, color: "#B4B2A9" }}>IMC calculado</span>
                  <div style={{ fontSize: 20, fontWeight: 300, color: "#2C2C2A", fontFamily: "Georgia, serif" }}>{imc.toFixed(1)}</div>
                </div>
                {imcCat && <Pill label={imcCat.label} bg={imcCat.bg} color={imcCat.color} />}
                <div style={{ marginLeft: "auto", fontSize: 11, color: "#B4B2A9" }}>
                  Anterior: {calcIMC(CONSULTA_ANTERIOR.peso, CONSULTA_ANTERIOR.talla).toFixed(1)}
                  <span style={{ color: "#1D9E75", marginLeft: 6, fontWeight: 500 }}>
                    ({(imc - calcIMC(CONSULTA_ANTERIOR.peso, CONSULTA_ANTERIOR.talla)).toFixed(2)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pliegues */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📌</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Pliegues cutáneos</div>
                <div style={{ fontSize: 10, color: "#B4B2A9" }}>Todos los valores en milímetros (mm) — ISAK</div>
              </div>
              {suma6 > 0 && (
                <div style={{ marginLeft: "auto", background: "#F5F4F0", borderRadius: 8, padding: "6px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#B4B2A9" }}>Σ6 pliegues (Yuhasz)</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#2C2C2A" }}>{suma6.toFixed(1)} mm</div>
                </div>
              )}
            </div>
            <Divider label="Pliegues para somatotipo y 5 componentes" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
              {["plTriceps","plSubescapular","plSupraespinal","plAbdominal","plMuslo","plPierna"].map(k => (
                <NumField key={k} fieldKey={k} value={data[k]} onChange={onChange}
                  warn={validaciones.warns[k]} error={validaciones.errors[k]} />
              ))}
            </div>
            <Divider label="Pliegues adicionales (Σ4 Durnin-Womersley)" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {["plBiceps","plCrestaIliaca"].map(k => (
                <NumField key={k} fieldKey={k} value={data[k]} onChange={onChange}
                  warn={validaciones.warns[k]} error={validaciones.errors[k]} />
              ))}
            </div>
            {suma4 > 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#B4B2A9" }}>
                Σ4 (Durnin-Womersley): <strong style={{ color: "#2C2C2A" }}>{suma4.toFixed(1)} mm</strong>
              </div>
            )}
          </div>

          {/* Perímetros */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>○</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Perímetros</div>
                <div style={{ fontSize: 10, color: "#B4B2A9" }}>Todos los valores en centímetros (cm)</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {["prBrazoRel","prBrazoFlex","prCintura","prCadera","prAntebrazo","prTorax","prMuslo","prPierna"].map(k => (
                <NumField key={k} fieldKey={k} value={data[k]} onChange={onChange}
                  warn={validaciones.warns[k]} error={validaciones.errors[k]} />
              ))}
            </div>
            {num.prCintura > 0 && num.prCadera > 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#B4B2A9" }}>
                Índice cintura/cadera: <strong style={{ color: num.prCintura/num.prCadera > (sexo==="F"?0.85:0.90) ? "#D85A30" : "#1D9E75" }}>
                  {(num.prCintura/num.prCadera).toFixed(2)}
                </strong>
                <span style={{ marginLeft: 4, fontSize: 10 }}>
                  (referencia {sexo==="F"?"<0.85":"<0.90"})
                </span>
              </div>
            )}
          </div>

          {/* Diámetros */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Diámetros óseos</div>
                <div style={{ fontSize: 10, color: "#B4B2A9" }}>En centímetros (cm) — calibre Vernier / paquímetro</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {["dHumeral","dBiestiloideo","dFemur","dBiacromial"].map(k => (
                <NumField key={k} fieldKey={k} value={data[k]} onChange={onChange}
                  warn={validaciones.warns[k]} error={validaciones.errors[k]} />
              ))}
            </div>
          </div>
        </div>

        {/* ─── PANEL DE RESULTADOS DERECHO (sticky) ─── */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 68, maxHeight: "calc(100vh - 90px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Resumen rápido */}
            <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Resumen en tiempo real</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "IMC", value: imc ? imc.toFixed(1) : "—", color: imc ? (imc<25?"#1D9E75":imc<30?"#EF9F27":"#D85A30") : "#B4B2A9" },
                  { label: "Σ6 Pliegues", value: suma6 > 0 ? `${suma6.toFixed(0)} mm` : "—", color: "#2C2C2A" },
                  { label: "% Graso", value: comp5 ? `${comp5.pctGrasa.toFixed(1)}%` : "—", color: "#D85A30" },
                  { label: "Masa musc.", value: comp5 ? `${comp5.masaMuscular.toFixed(1)} kg` : "—", color: "#1D9E75" },
                  { label: "Índice M/O", value: comp5 ? comp5.indiceMO.toFixed(2) : "—", color: "#378ADD" },
                  { label: "Índice G/M", value: comp5 ? comp5.indiceGM.toFixed(2) : "—", color: "#EF9F27" },
                ].map(m => (
                  <div key={m.label} style={{ background: "#F5F4F0", borderRadius: 9, padding: "9px 11px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: m.color, fontFamily: "Georgia, serif" }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: "#B4B2A9", marginTop: 1 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              {soma && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#E1F5EE", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: "#B4B2A9", marginBottom: 3 }}>Somatotipo Heath-Carter</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#0F6E56" }}>
                      {soma.endo.toFixed(1)} – {soma.meso.toFixed(1)} – {soma.ecto.toFixed(1)}
                    </div>
                    <Pill label={somaTipo || "—"} bg="#E1F5EE" color="#0F6E56" />
                  </div>
                  <div style={{ fontSize: 10, color: "#5F5E5A", marginTop: 2 }}>Endo – Meso – Ecto</div>
                </div>
              )}
            </div>

            {/* 5 Componentes */}
            {comp5 && (
              <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>5 Componentes — Ross & Kerr</div>
                  <span style={{ fontSize: 9, color: "#B4B2A9" }}>∆ vs. consulta anterior</span>
                </div>
                {["masaGrasa","masaMuscular","masaOsea","masaResidual","masaPiel"].map(key => (
                  <ComponentBar
                    key={key}
                    label={COMP_LABELS[key]}
                    kg={comp5[key]}
                    pct={comp5[`pct${key.charAt(0).toUpperCase()+key.slice(1).replace("masa","")}`] || comp5[key] / num.peso * 100}
                    color={COMP_COLORS[key]}
                    prevKg={comp5Ant?.[key]}
                  />
                ))}
                <div style={{ marginTop: 10, padding: "8px 10px", background: "#F5F4F0", borderRadius: 8, display: "flex", gap: 16 }}>
                  <div style={{ fontSize: 10 }}>
                    <span style={{ color: "#B4B2A9" }}>Índice Músculo/Óseo: </span>
                    <strong style={{ color: "#378ADD" }}>{comp5.indiceMO.toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: 10 }}>
                    <span style={{ color: "#B4B2A9" }}>Índice Grasa/Músculo: </span>
                    <strong style={{ color: comp5.indiceGM > 0.8 ? "#D85A30" : "#1D9E75" }}>{comp5.indiceGM.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Somatocarta */}
            <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Somatocarta</div>
                <span style={{ fontSize: 9, color: "#B4B2A9" }}>Método Heath-Carter</span>
              </div>
              <Somatocarta soma={soma} somaAnterior={somaAnterior} />
              {soma && (
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {[["Endomorfia","#D85A30",soma.endo],["Mesomorfia","#1D9E75",soma.meso],["Ectomorfia","#378ADD",soma.ecto]].map(([l,c,v])=>(
                    <div key={l} style={{ textAlign:"center", background:"#F5F4F0", borderRadius:8, padding:"7px" }}>
                      <div style={{ fontSize:14, fontWeight:500, color:c, fontFamily:"Georgia,serif" }}>{v.toFixed(1)}</div>
                      <div style={{ fontSize:9, color:"#B4B2A9" }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alertas */}
            {Object.keys(validaciones.errors).length > 0 && (
              <div style={{ background: "#FAECE7", border: "1px solid #F5C4B0", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#712B13", marginBottom: 8 }}>⚠ Valores fuera de rango</div>
                {Object.entries(validaciones.errors).map(([k, msg]) => (
                  <div key={k} style={{ fontSize: 11, color: "#712B13", marginBottom: 4, display: "flex", gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>{RANGES[k]?.label}:</span> {msg}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
