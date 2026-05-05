// src/lib/formulas.js
// Fórmulas nutricionales y antropométricas reutilizables en toda la app

// ─── IMC ─────────────────────────────────────────────────────────────────────
export const calcIMC = (pesoKg, tallaCm) =>
  tallaCm > 0 ? pesoKg / ((tallaCm / 100) ** 2) : null;

export const categoriaIMC = (imc) => {
  if (!imc) return null;
  if (imc < 18.5) return { label: "Bajo peso",  bg: "#E6F1FB", color: "#0C447C" };
  if (imc < 25)   return { label: "Normopeso",   bg: "#E1F5EE", color: "#0F6E56" };
  if (imc < 30)   return { label: "Sobrepeso",   bg: "#FAEEDA", color: "#633806" };
  return               { label: "Obesidad",    bg: "#FAECE7", color: "#712B13" };
};

// ─── GASTO ENERGÉTICO ────────────────────────────────────────────────────────

/** Harris-Benedict revisada (Roza & Shizgal, 1984) */
export const harrisBenedict = (peso, talla, edad, sexo) => {
  if (sexo === "M" || sexo === "Masculino")
    return 88.362 + 13.397 * peso + 4.799 * talla - 5.677 * edad;
  return 447.593 + 9.247 * peso + 3.098 * talla - 4.330 * edad;
};

/** Mifflin-St Jeor (1990) */
export const mifflinStJeor = (peso, talla, edad, sexo) => {
  const base = 10 * peso + 6.25 * talla - 5 * edad;
  return (sexo === "M" || sexo === "Masculino") ? base + 5 : base - 161;
};

/** Factores de actividad OMS */
export const FACTORES_ACTIVIDAD = {
  "Sedentario":               1.2,
  "Actividad liviana":        1.375,
  "Actividad moderada":       1.55,
  "Actividad intensa":        1.725,
  "Actividad muy intensa":    1.9,
};

export const calcVCT = (tmb, factorActividad) => tmb * factorActividad;

// ─── COMPOSICIÓN CORPORAL (DURNIN-WOMERSLEY) ─────────────────────────────────
export const calcPctGrasa = (sigma4, sexo, edad) => {
  if (!sigma4 || sigma4 <= 0) return null;
  const logS = Math.log10(sigma4);
  const sx = sexo === "M" || sexo === "Masculino" ? "M" : "F";
  let densidad;
  if (sx === "M") {
    if (edad < 17)      densidad = 1.1533 - 0.0643 * logS;
    else if (edad < 20) densidad = 1.1620 - 0.0630 * logS;
    else if (edad < 30) densidad = 1.1631 - 0.0632 * logS;
    else if (edad < 40) densidad = 1.1422 - 0.0544 * logS;
    else if (edad < 50) densidad = 1.1620 - 0.0700 * logS;
    else                densidad = 1.1715 - 0.0779 * logS;
  } else {
    if (edad < 17)      densidad = 1.1369 - 0.0598 * logS;
    else if (edad < 20) densidad = 1.1549 - 0.0678 * logS;
    else if (edad < 30) densidad = 1.1599 - 0.0717 * logS;
    else if (edad < 40) densidad = 1.1423 - 0.0632 * logS;
    else if (edad < 50) densidad = 1.1333 - 0.0612 * logS;
    else                densidad = 1.1339 - 0.0645 * logS;
  }
  return ((4.95 / densidad) - 4.50) * 100;
};

// ─── 5 COMPONENTES — ROSS & KERR (1993) ──────────────────────────────────────
export const calc5Componentes = (medidas, sexo, edad) => {
  const { peso, talla, dHumeral, dFemur,
          plBiceps, plTriceps, plSubescapular, plCrestaIliaca } = medidas;
  if (!peso || !talla || !dHumeral || !dFemur) return null;

  const h = talla / 100;
  const sigma4 = (plBiceps || 0) + (plTriceps || 0) +
                 (plSubescapular || 0) + (plCrestaIliaca || 0);
  const pctG   = calcPctGrasa(sigma4, sexo, edad) || 0;
  const masaGrasa    = Math.max(0, peso * pctG / 100);
  const masaOsea     = Math.max(0, 3.02 * ((h * h * dHumeral * dFemur * 400) ** 0.712));
  const masaResidual = Math.max(0, (sexo === "M" || sexo === "Masculino") ? peso * 0.241 : peso * 0.209);
  const masaPiel     = Math.max(0, Math.sqrt((talla * peso) / 3600) * 2.51);
  const masaMuscular = Math.max(0, peso - (masaGrasa + masaOsea + masaResidual + masaPiel));

  return {
    masaGrasa, masaMuscular, masaOsea, masaResidual, masaPiel,
    pctGrasa:    (masaGrasa    / peso) * 100,
    pctMuscular: (masaMuscular / peso) * 100,
    pctOsea:     (masaOsea     / peso) * 100,
    pctResidual: (masaResidual / peso) * 100,
    pctPiel:     (masaPiel     / peso) * 100,
    indiceMO:    masaMuscular / Math.max(0.01, masaOsea),
    indiceGM:    masaGrasa    / Math.max(0.01, masaMuscular),
  };
};

// ─── SOMATOTIPO HEATH-CARTER (1990) ──────────────────────────────────────────
export const calcSomatotipo = (medidas) => {
  const { peso, talla, plTriceps, plSubescapular, plSupraespinal,
          prBrazoFlex, prPierna, dHumeral, dFemur, plPierna } = medidas;
  if (!peso || !talla || !plTriceps || !prBrazoFlex || !dHumeral || !dFemur)
    return null;

  // Endomorfia
  const sumEndo = plTriceps + (plSubescapular || 0) + (plSupraespinal || 0);
  const sumCorr = sumEndo * (170.18 / talla);
  const endo = Math.max(0.1,
    -0.7182 + 0.1451 * sumCorr - 0.00068 * sumCorr ** 2 + 0.0000014 * sumCorr ** 3
  );

  // Mesomorfia
  const brachioCirc = prBrazoFlex - (plTriceps / 10);
  const calfCirc    = (prPierna || 0) - ((plPierna || 0) / 10);
  const meso = Math.max(0.1,
    0.858 * dHumeral + 0.601 * dFemur
    + 0.188 * brachioCirc + 0.161 * calfCirc
    - 0.131 * talla + 4.50
  );

  // Ectomorfia
  const ipc = talla / (peso ** (1 / 3));
  let ecto;
  if (ipc >= 40.75)       ecto = 0.732 * ipc - 28.58;
  else if (ipc >= 38.25)  ecto = 0.463 * ipc - 17.63;
  else                    ecto = 0.1;

  return { endo, meso, ecto: Math.max(0.1, ecto) };
};

/** Coordenadas X/Y para la somatocarta */
export const somaCoords = (s) => ({
  x: s.ecto - s.endo,
  y: 2 * s.meso - (s.endo + s.ecto),
});

/** Etiqueta del tipo somatotípico */
export const somaTipo = (s) => {
  const { endo, meso, ecto } = s;
  const max = Math.max(endo, meso, ecto);
  if (max === meso && Math.abs(endo - ecto) <= 1) return "Meso equilibrado";
  if (max === meso && endo > ecto + 1)             return "Endo-Mesomorfo";
  if (max === meso && ecto > endo + 1)             return "Meso-Ectomorfo";
  if (max === endo && meso > ecto + 1)             return "Endo-Mesomorfo";
  if (max === endo)                                return "Endomórfico";
  if (max === ecto && meso > endo + 1)             return "Meso-Ectomorfo";
  if (max === ecto)                                return "Ectomórfico";
  return "Central";
};

// ─── NUTRIENTES ──────────────────────────────────────────────────────────────

/** Calcula nutrientes de un alimento para X gramos */
export const calcNutrientes = (alimento, gramos) => {
  const f = gramos / 100;
  return {
    kcal: alimento.kcal * f,
    hc:   alimento.hc   * f,
    prot: alimento.prot * f,
    gras: alimento.gras * f,
    ca:   alimento.ca   * f,
    fe:   alimento.fe   * f,
    zn:   alimento.zn   * f,
    b12:  alimento.b12  * f,
    vitD: alimento.vitD * f,
  };
};

/** Suma nutrientes de una lista de items del plan */
export const sumNutrientes = (items) =>
  items.reduce((acc, item) => {
    const n = calcNutrientes(item.alimento || item.ali, item.gramos || item.g);
    return {
      kcal: acc.kcal + n.kcal, hc:   acc.hc   + n.hc,
      prot: acc.prot + n.prot, gras: acc.gras  + n.gras,
      ca:   acc.ca   + n.ca,   fe:   acc.fe    + n.fe,
      zn:   acc.zn   + n.zn,   b12:  acc.b12   + n.b12,
      vitD: acc.vitD + n.vitD,
    };
  }, { kcal:0, hc:0, prot:0, gras:0, ca:0, fe:0, zn:0, b12:0, vitD:0 });

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

/** Calcula la edad desde una fecha de nacimiento */
export const calcEdad = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad > 0 ? edad : null;
};

/** Formatea un DNI argentino con puntos */
export const formatDNI = (v) => {
  const clean = v.replace(/\D/g, "").slice(0, 9);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return clean.slice(0,3) + "." + clean.slice(3);
  return clean.slice(0,2) + "." + clean.slice(2,5) + "." + clean.slice(5);
};
