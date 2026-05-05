import { useState, useMemo, useRef } from "react";

// ─── BASE DE ALIMENTOS (muestra representativa — importable desde CSV/USDA/Nutrinfo) ───
const ALIMENTOS_DB = [
  // Cereales y panificados
  { id:1,  nombre:"Avena arrollada",          cat:"Cereales",    kcal:367, hc:59.3, prot:13.2, gras:7.1,  ca:52,  fe:4.6, zn:3.6, b12:0,    vitD:0    },
  { id:2,  nombre:"Pan integral de molde",    cat:"Cereales",    kcal:247, hc:41.4, prot:9.0,  gras:3.5,  ca:80,  fe:2.5, zn:1.5, b12:0,    vitD:0    },
  { id:3,  nombre:"Arroz integral cocido",    cat:"Cereales",    kcal:111, hc:23.0, prot:2.6,  gras:0.9,  ca:10,  fe:0.5, zn:0.6, b12:0,    vitD:0    },
  { id:4,  nombre:"Quinoa cocida",            cat:"Cereales",    kcal:120, hc:21.3, prot:4.4,  gras:1.9,  ca:17,  fe:1.5, zn:1.1, b12:0,    vitD:0    },
  { id:5,  nombre:"Fideos de trigo integral", cat:"Cereales",    kcal:348, hc:65.1, prot:14.6, gras:2.5,  ca:26,  fe:3.8, zn:2.1, b12:0,    vitD:0    },
  { id:6,  nombre:"Papa hervida",             cat:"Tubérculos",  kcal:87,  hc:20.1, prot:1.9,  gras:0.1,  ca:5,   fe:0.3, zn:0.3, b12:0,    vitD:0    },
  // Proteínas animales
  { id:10, nombre:"Pechuga de pollo (sin piel)", cat:"Carnes",   kcal:165, hc:0,    prot:31.0, gras:3.6,  ca:15,  fe:1.0, zn:1.0, b12:0.3,  vitD:0.1  },
  { id:11, nombre:"Carne vacuna magra (nalga)",  cat:"Carnes",   kcal:158, hc:0,    prot:26.1, gras:5.7,  ca:18,  fe:2.6, zn:4.8, b12:2.0,  vitD:0.1  },
  { id:12, nombre:"Atún en agua (lata)",     cat:"Pescados",    kcal:116, hc:0,    prot:25.5, gras:1.0,  ca:10,  fe:1.6, zn:0.9, b12:2.5,  vitD:4.0  },
  { id:13, nombre:"Salmón fresco",           cat:"Pescados",    kcal:208, hc:0,    prot:20.4, gras:13.4, ca:12,  fe:0.3, zn:0.6, b12:3.2,  vitD:11.0 },
  { id:14, nombre:"Huevo entero",            cat:"Huevos",      kcal:155, hc:1.1,  prot:12.6, gras:10.6, ca:50,  fe:1.8, zn:1.3, b12:1.1,  vitD:2.0  },
  { id:15, nombre:"Clara de huevo",          cat:"Huevos",      kcal:52,  hc:0.7,  prot:10.9, gras:0.2,  ca:7,   fe:0.1, zn:0.03,b12:0.09, vitD:0    },
  // Lácteos
  { id:20, nombre:"Leche descremada (1 taza)",cat:"Lácteos",    kcal:83,  hc:12.2, prot:8.2,  gras:0.2,  ca:299, fe:0.1, zn:1.0, b12:1.2,  vitD:2.5  },
  { id:21, nombre:"Yogur natural descremado",cat:"Lácteos",     kcal:56,  hc:7.7,  prot:5.7,  gras:0.4,  ca:199, fe:0.1, zn:0.9, b12:0.75, vitD:0    },
  { id:22, nombre:"Queso cottage",           cat:"Lácteos",     kcal:98,  hc:3.4,  prot:11.1, gras:4.3,  ca:83,  fe:0.2, zn:0.5, b12:0.4,  vitD:0    },
  { id:23, nombre:"Ricota descremada",       cat:"Lácteos",     kcal:138, hc:3.0,  prot:11.0, gras:9.0,  ca:207, fe:0.4, zn:1.1, b12:0.3,  vitD:0    },
  // Legumbres
  { id:30, nombre:"Lentejas cocidas",        cat:"Legumbres",   kcal:116, hc:20.1, prot:9.0,  gras:0.4,  ca:19,  fe:3.3, zn:1.3, b12:0,    vitD:0    },
  { id:31, nombre:"Garbanzos cocidos",       cat:"Legumbres",   kcal:164, hc:27.4, prot:8.9,  gras:2.6,  ca:49,  fe:2.9, zn:1.5, b12:0,    vitD:0    },
  { id:32, nombre:"Porotos negros cocidos",  cat:"Legumbres",   kcal:132, hc:23.7, prot:8.9,  gras:0.5,  ca:23,  fe:2.1, zn:1.0, b12:0,    vitD:0    },
  // Verduras
  { id:40, nombre:"Espinaca cruda",          cat:"Verduras",    kcal:23,  hc:3.6,  prot:2.9,  gras:0.4,  ca:99,  fe:2.7, zn:0.5, b12:0,    vitD:0    },
  { id:41, nombre:"Brócoli cocido",          cat:"Verduras",    kcal:35,  hc:7.2,  prot:2.4,  gras:0.4,  ca:40,  fe:0.7, zn:0.4, b12:0,    vitD:0    },
  { id:42, nombre:"Zanahoria cruda",         cat:"Verduras",    kcal:41,  hc:9.6,  prot:0.9,  gras:0.2,  ca:33,  fe:0.3, zn:0.2, b12:0,    vitD:0    },
  { id:43, nombre:"Tomate crudo",            cat:"Verduras",    kcal:18,  hc:3.9,  prot:0.9,  gras:0.2,  ca:10,  fe:0.3, zn:0.2, b12:0,    vitD:0    },
  { id:44, nombre:"Lechuga",                 cat:"Verduras",    kcal:15,  hc:2.9,  prot:1.4,  gras:0.2,  ca:36,  fe:0.9, zn:0.2, b12:0,    vitD:0    },
  { id:45, nombre:"Berenjena cocida",        cat:"Verduras",    kcal:35,  hc:8.7,  prot:0.8,  gras:0.2,  ca:6,   fe:0.2, zn:0.1, b12:0,    vitD:0    },
  // Frutas
  { id:50, nombre:"Banana mediana (120g)",   cat:"Frutas",      kcal:89,  hc:22.8, prot:1.1,  gras:0.3,  ca:5,   fe:0.3, zn:0.2, b12:0,    vitD:0    },
  { id:51, nombre:"Manzana con piel",        cat:"Frutas",      kcal:52,  hc:13.8, prot:0.3,  gras:0.2,  ca:6,   fe:0.1, zn:0.04,b12:0,    vitD:0    },
  { id:52, nombre:"Naranja",                 cat:"Frutas",      kcal:47,  hc:11.8, prot:0.9,  gras:0.1,  ca:40,  fe:0.1, zn:0.1, b12:0,    vitD:0    },
  { id:53, nombre:"Frutillas",               cat:"Frutas",      kcal:32,  hc:7.7,  prot:0.7,  gras:0.3,  ca:16,  fe:0.4, zn:0.1, b12:0,    vitD:0    },
  // Grasas saludables
  { id:60, nombre:"Palta (½ unidad)",        cat:"Grasas",      kcal:160, hc:8.5,  prot:2.0,  gras:14.7, ca:12,  fe:0.6, zn:0.6, b12:0,    vitD:0    },
  { id:61, nombre:"Aceite de oliva",         cat:"Grasas",      kcal:884, hc:0,    prot:0,    gras:100,  ca:1,   fe:0.6, zn:0.05,b12:0,    vitD:0    },
  { id:62, nombre:"Nueces",                  cat:"Grasas",      kcal:654, hc:13.7, prot:15.2, gras:65.2, ca:98,  fe:2.9, zn:3.1, b12:0,    vitD:0    },
  { id:63, nombre:"Almendras",               cat:"Grasas",      kcal:579, hc:21.6, prot:21.2, gras:49.9, ca:264, fe:3.7, zn:3.1, b12:0,    vitD:0    },
  // Otros
  { id:70, nombre:"Mate (200ml, sin azúcar)",cat:"Bebidas",     kcal:2,   hc:0.3,  prot:0.1,  gras:0,    ca:5,   fe:0.2, zn:0.1, b12:0,    vitD:0    },
  { id:71, nombre:"Semillas de chía (1cdas)",cat:"Semillas",    kcal:138, hc:11.9, prot:4.7,  gras:8.7,  ca:177, fe:2.2, zn:1.0, b12:0,    vitD:0    },
  { id:72, nombre:"Mantequilla de maní",     cat:"Semillas",    kcal:588, hc:20.1, prot:25.1, gras:50.4, ca:43,  fe:1.7, zn:2.5, b12:0,    vitD:0    },
];

const MOMENTOS = ["Desayuno","Colación mañana","Almuerzo","Merienda","Colación tarde","Cena"];

// Objetivos del paciente (vendrían del módulo de Requerimiento Calórico)
const OBJETIVOS = { vct: 1550, hc: 194, prot: 97, gras: 52, ca: 1000, fe: 18, zn: 8, b12: 2.4, vitD: 15 };

const PACIENTE = { nombre: "Sofía Castillo", edad: 41, fecha: "28/04/2025",
  profesional: "Lic. Micaela Russo", mp: "MP 8432", email: "lic.russo.nutricion@gmail.com", tel: "+54 11 4523-8891" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcNutrientes = (alimento, gramos) => {
  const f = gramos / 100;
  return {
    kcal: alimento.kcal * f, hc: alimento.hc * f, prot: alimento.prot * f,
    gras: alimento.gras * f, ca: alimento.ca * f, fe: alimento.fe * f,
    zn: alimento.zn * f, b12: alimento.b12 * f, vitD: alimento.vitD * f,
  };
};

const sumNutrientes = (items) =>
  items.reduce((acc, item) => {
    const n = calcNutrientes(item.alimento, item.gramos);
    return { kcal: acc.kcal+n.kcal, hc: acc.hc+n.hc, prot: acc.prot+n.prot,
             gras: acc.gras+n.gras, ca: acc.ca+n.ca, fe: acc.fe+n.fe,
             zn: acc.zn+n.zn, b12: acc.b12+n.b12, vitD: acc.vitD+n.vitD };
  }, { kcal:0, hc:0, prot:0, gras:0, ca:0, fe:0, zn:0, b12:0, vitD:0 });

// ─── PDF GENERATOR ───────────────────────────────────────────────────────────
const generarPDF = (plan, totales, objetivos, paciente, momentos) => {
  const w = window.open("", "_blank");
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#fff;color:#2C2C2A;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
    .page{max-width:794px;margin:0 auto;padding:48px 52px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:2px solid #1D9E75;margin-bottom:32px;}
    .logo-box{display:flex;align-items:center;gap:14px;}
    .logo-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#1D9E75,#0F6E56);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;}
    .logo-text .name{font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:600;color:#2C2C2A;}
    .logo-text .sub{font-size:11px;color:#888780;margin-top:2px;}
    .header-info{text-align:right;font-size:11px;color:#888780;line-height:1.7;}
    .title-section{margin-bottom:28px;}
    .plan-title{font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:400;color:#2C2C2A;margin-bottom:4px;}
    .plan-sub{font-size:12px;color:#888780;}
    .patient-row{display:flex;gap:32px;background:#F5F4F0;border-radius:12px;padding:16px 20px;margin-bottom:28px;}
    .patient-item label{font-size:10px;color:#B4B2A9;font-weight:500;text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:3px;}
    .patient-item span{font-size:13px;color:#2C2C2A;font-weight:500;}
    .section-title{font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
    .section-title::after{content:'';flex:1;height:1px;background:#E8E6DF;}
    .macros-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px;}
    .macro-box{background:#F5F4F0;border-radius:10px;padding:12px;text-align:center;}
    .macro-box.kcal{background:#E1F5EE;}
    .macro-val{font-size:20px;font-weight:300;color:#2C2C2A;font-family:'Playfair Display',Georgia,serif;}
    .macro-lbl{font-size:10px;color:#888780;margin-top:2px;}
    .macro-pct{font-size:11px;color:#1D9E75;font-weight:500;margin-top:1px;}
    .meal-block{margin-bottom:20px;break-inside:avoid;}
    .meal-header{display:flex;justify-content:space-between;align-items:center;background:#1D9E75;color:#fff;border-radius:8px 8px 0 0;padding:8px 14px;}
    .meal-header .meal-name{font-size:12px;font-weight:600;letter-spacing:.02em;}
    .meal-header .meal-kcal{font-size:11px;opacity:.85;}
    .meal-table{width:100%;border-collapse:collapse;border:1px solid #E8E6DF;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;}
    .meal-table th{font-size:9px;font-weight:500;color:#B4B2A9;text-transform:uppercase;letter-spacing:.04em;padding:8px 12px;background:#FAFAF8;text-align:left;border-bottom:1px solid #E8E6DF;}
    .meal-table td{font-size:11px;color:#2C2C2A;padding:8px 12px;border-bottom:1px solid #F5F4F0;}
    .meal-table tr:last-child td{border-bottom:none;}
    .meal-table .td-food{font-weight:500;}
    .meal-table .td-num{color:#5F5E5A;text-align:right;}
    .micros-table{width:100%;border-collapse:collapse;margin-bottom:28px;}
    .micros-table th{font-size:10px;font-weight:500;color:#B4B2A9;text-transform:uppercase;letter-spacing:.04em;padding:8px 12px;border-bottom:2px solid #E8E6DF;text-align:left;}
    .micros-table td{font-size:11px;padding:8px 12px;border-bottom:1px solid #F5F4F0;color:#2C2C2A;}
    .micros-table .status{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;}
    .ok{background:#E1F5EE;color:#0F6E56;}.low{background:#FAEEDA;color:#633806;}.high{background:#FAECE7;color:#712B13;}
    .notes-box{background:#F5F4F0;border-radius:12px;padding:18px 20px;margin-bottom:28px;}
    .notes-title{font-size:11px;font-weight:600;color:#0F6E56;margin-bottom:10px;}
    .notes-list{list-style:none;}
    .notes-list li{font-size:12px;color:#5F5E5A;line-height:1.7;padding-left:16px;position:relative;}
    .notes-list li::before{content:'✦';position:absolute;left:0;color:#1D9E75;font-size:9px;top:3px;}
    .footer{margin-top:40px;padding-top:20px;border-top:1px solid #E8E6DF;display:flex;justify-content:space-between;align-items:center;}
    .footer-left{font-size:10px;color:#B4B2A9;line-height:1.6;}
    .footer-right{text-align:right;}
    .firma-linea{width:160px;height:1px;background:#2C2C2A;margin-bottom:4px;margin-left:auto;}
    .firma-nombre{font-size:11px;font-weight:500;color:#2C2C2A;}
    .firma-mp{font-size:10px;color:#B4B2A9;}
    .prog-bar-pdf{height:6px;background:#F1F0EA;border-radius:3px;overflow:hidden;margin-top:4px;}
    .prog-fill-pdf{height:100%;border-radius:3px;}
    @media print{body{padding:0;} .page{padding:32px 40px;} .no-print{display:none;}}
  `;

  const totalKcal = totales.kcal;
  const pctHC   = Math.round((totales.hc   * 4) / Math.max(1,totalKcal) * 100);
  const pctProt = Math.round((totales.prot  * 4) / Math.max(1,totalKcal) * 100);
  const pctGras = Math.round((totales.gras  * 9) / Math.max(1,totalKcal) * 100);

  const microRows = [
    { label:"Calcio (Ca)", val:totales.ca, obj:objetivos.ca, unit:"mg" },
    { label:"Hierro (Fe)", val:totales.fe, obj:objetivos.fe, unit:"mg" },
    { label:"Zinc (Zn)",   val:totales.zn, obj:objetivos.zn, unit:"mg" },
    { label:"Vitamina B12",val:totales.b12,obj:objetivos.b12,unit:"µg" },
    { label:"Vitamina D",  val:totales.vitD,obj:objetivos.vitD,unit:"µg" },
  ].map(m => {
    const pct = Math.round((m.val / m.obj) * 100);
    const cls = pct >= 85 ? "ok" : pct >= 50 ? "low" : "high";
    const lbl = pct >= 85 ? "Adecuado" : pct >= 50 ? "Bajo" : "Deficiente";
    return `<tr>
      <td>${m.label}</td>
      <td class="td-num">${m.val.toFixed(1)} ${m.unit}</td>
      <td class="td-num">${m.obj} ${m.unit}</td>
      <td><div class="prog-bar-pdf"><div class="prog-fill-pdf" style="width:${Math.min(100,pct)}%;background:${cls==="ok"?"#1D9E75":cls==="low"?"#EF9F27":"#D85A30"}"></div></div></td>
      <td><span class="status ${cls}">${lbl} (${pct}%)</span></td>
    </tr>`;
  }).join("");

  const mealBlocks = momentos.map(momento => {
    const items = plan.filter(i => i.momento === momento);
    if (!items.length) return "";
    const sub = sumNutrientes(items);
    const rows = items.map(item => {
      const n = calcNutrientes(item.alimento, item.gramos);
      return `<tr>
        <td class="td-food">${item.alimento.nombre}</td>
        <td class="td-num">${item.gramos} g</td>
        <td class="td-num">${n.kcal.toFixed(0)}</td>
        <td class="td-num">${n.hc.toFixed(1)}</td>
        <td class="td-num">${n.prot.toFixed(1)}</td>
        <td class="td-num">${n.gras.toFixed(1)}</td>
      </tr>`;
    }).join("");
    return `<div class="meal-block">
      <div class="meal-header">
        <span class="meal-name">${momento}</span>
        <span class="meal-kcal">${sub.kcal.toFixed(0)} kcal</span>
      </div>
      <table class="meal-table">
        <thead><tr><th>Alimento</th><th>Gramos</th><th>Kcal</th><th>HC (g)</th><th>Prot (g)</th><th>Grasas (g)</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join("");

  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Plan Alimentario — ${paciente.nombre}</title><style>${css}</style></head><body>
  <div class="page">
    <div class="header">
      <div class="logo-box">
        <div class="logo-icon">✦</div>
        <div class="logo-text">
          <div class="name">${paciente.profesional}</div>
          <div class="sub">Licenciada en Nutrición · M.P. ${paciente.mp}</div>
        </div>
      </div>
      <div class="header-info">
        <div>${paciente.email}</div>
        <div>${paciente.tel}</div>
        <div>${paciente.fecha}</div>
      </div>
    </div>

    <div class="title-section">
      <div class="plan-title">Plan Alimentario Personalizado</div>
      <div class="plan-sub">Fórmula desarrollada · Consulta C4 · ${paciente.fecha}</div>
    </div>

    <div class="patient-row">
      <div class="patient-item"><label>Paciente</label><span>${paciente.nombre}</span></div>
      <div class="patient-item"><label>Edad</label><span>${paciente.edad} años</span></div>
      <div class="patient-item"><label>VCT objetivo</label><span>${objetivos.vct} kcal</span></div>
      <div class="patient-item"><label>Plan total</label><span>${totalKcal.toFixed(0)} kcal</span></div>
      <div class="patient-item"><label>Distribución</label><span>HC ${pctHC}% · P ${pctProt}% · G ${pctGras}%</span></div>
    </div>

    <div class="section-title">Resumen de macronutrientes</div>
    <div class="macros-grid">
      <div class="macro-box kcal">
        <div class="macro-val">${totalKcal.toFixed(0)}</div>
        <div class="macro-lbl">kcal totales</div>
        <div class="macro-pct">${Math.round(totalKcal/objetivos.vct*100)}% del objetivo</div>
      </div>
      <div class="macro-box">
        <div class="macro-val">${totales.hc.toFixed(1)}g</div>
        <div class="macro-lbl">Hidratos de carbono</div>
        <div class="macro-pct">${pctHC}% del VCT</div>
      </div>
      <div class="macro-box">
        <div class="macro-val">${totales.prot.toFixed(1)}g</div>
        <div class="macro-lbl">Proteínas</div>
        <div class="macro-pct">${pctProt}% del VCT</div>
      </div>
      <div class="macro-box">
        <div class="macro-val">${totales.gras.toFixed(1)}g</div>
        <div class="macro-lbl">Grasas</div>
        <div class="macro-pct">${pctGras}% del VCT</div>
      </div>
    </div>

    <div class="section-title">Distribución por comidas</div>
    ${mealBlocks}

    <div class="section-title">Micronutrientes críticos</div>
    <table class="micros-table">
      <thead><tr><th>Nutriente</th><th>Aporte</th><th>Objetivo</th><th>Cobertura</th><th>Estado</th></tr></thead>
      <tbody>${microRows}</tbody>
    </table>

    <div class="notes-box">
      <div class="notes-title">Indicaciones generales</div>
      <ul class="notes-list">
        <li>Consumir mínimo 2 litros de agua por día, preferentemente sin saborizantes artificiales.</li>
        <li>Respetar los momentos de comida establecidos para regular el ritmo metabólico y la saciedad.</li>
        <li>Las porciones indicadas en gramos son en crudo salvo que se especifique lo contrario.</li>
        <li>Ante cualquier síntoma digestivo o intolerancia, comunicarse antes de la próxima consulta.</li>
        <li>Próxima consulta de seguimiento en 3 semanas. Se realizará ajuste de plan según evolución.</li>
      </ul>
    </div>

    <div class="footer">
      <div class="footer-left">
        <div>NutriApp · Sistema de gestión nutricional</div>
        <div>Documento generado el ${new Date().toLocaleDateString("es-AR", {day:"2-digit",month:"long",year:"numeric"})}</div>
        <div style="margin-top:4px;font-size:9px">Este plan es de uso exclusivo del paciente indicado y no debe ser reproducido sin autorización profesional.</div>
      </div>
      <div class="footer-right">
        <div class="firma-linea"></div>
        <div class="firma-nombre">${paciente.profesional}</div>
        <div class="firma-mp">Lic. en Nutrición · M.P. ${paciente.mp}</div>
      </div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();}</script>
  </body></html>`);
  w.document.close();
};

// ─── COMPONENTES UI ───────────────────────────────────────────────────────────
function MacroBar({ label, actual, objetivo, color, unit = "g" }) {
  const pct = Math.min(100, Math.round((actual / objetivo) * 100));
  const over = actual > objetivo * 1.05;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#2C2C2A" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: over ? "#D85A30" : "#2C2C2A" }}>{actual.toFixed(1)}{unit}</span>
          <span style={{ fontSize: 10, color: "#B4B2A9" }}>/ {objetivo}{unit}</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: pct >= 90 ? "#1D9E75" : pct >= 60 ? "#EF9F27" : "#B4B2A9" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 7, background: "#F1F0EA", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: over ? "#D85A30" : color,
          borderRadius: 4, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function MicroBadge({ label, actual, objetivo, unit }) {
  const pct = Math.round((actual / objetivo) * 100);
  const cfg = pct >= 85 ? { bg: "#E1F5EE", color: "#0F6E56" }
            : pct >= 50 ? { bg: "#FAEEDA", color: "#633806" }
            : { bg: "#FAECE7", color: "#712B13" };
  return (
    <div style={{ background: cfg.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: cfg.color }}>{actual.toFixed(1)}<span style={{ fontSize: 9, marginLeft: 1, opacity: 0.7 }}>{unit}</span></div>
      <div style={{ fontSize: 9, color: "#B4B2A9", marginTop: 1 }}>{label}</div>
      <div style={{ fontSize: 9, fontWeight: 500, color: cfg.color, marginTop: 1 }}>{pct}%</div>
    </div>
  );
}

function Pill({ label, bg, color, small }) {
  return <span style={{ fontSize: small ? 9 : 10, padding: small ? "1px 6px" : "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>;
}

// ─── BUSCADOR DE ALIMENTOS ───────────────────────────────────────────────────
function BuscadorAlimentos({ onAgregar, momentoActivo }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [gramos, setGramos] = useState("");
  const [momento, setMomento] = useState(momentoActivo || "Desayuno");
  const inputRef = useRef(null);

  const resultados = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return ALIMENTOS_DB.filter(a =>
      a.nombre.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const preview = useMemo(() => {
    if (!selected || !gramos) return null;
    return calcNutrientes(selected, parseFloat(gramos) || 0);
  }, [selected, gramos]);

  const handleAgregar = () => {
    if (!selected || !gramos || parseFloat(gramos) <= 0) return;
    onAgregar({ alimento: selected, gramos: parseFloat(gramos), momento });
    setSelected(null);
    setQuery("");
    setGramos("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Agregar alimento al plan</div>

      {/* Selector de momento */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: "#5F5E5A", marginBottom: 6 }}>Momento del día</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MOMENTOS.map(m => (
            <button key={m} onClick={() => setMomento(m)} style={{
              padding: "5px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              border: "1.5px solid", transition: "all 0.12s",
              borderColor: momento === m ? "#1D9E75" : "#E8E6DF",
              background: momento === m ? "#E1F5EE" : "#fff",
              color: momento === m ? "#0F6E56" : "#5F5E5A",
              fontWeight: momento === m ? 500 : 400,
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#B4B2A9", fontSize: 14 }}>⌕</div>
        <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Buscar alimento (nombre o categoría)…"
          style={{ width: "100%", padding: "9px 12px 9px 32px", border: "1.5px solid #E8E6DF", borderRadius: 10, fontSize: 12, color: "#2C2C2A", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor="#1D9E75"}
          onBlur={e => e.target.style.borderColor="#E8E6DF"} />
      </div>

      {/* Resultados */}
      {resultados.length > 0 && !selected && (
        <div style={{ border: "1px solid #E8E6DF", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
          {resultados.map((a, i) => (
            <div key={a.id} onClick={() => { setSelected(a); setQuery(a.nombre); }}
              style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < resultados.length-1 ? "1px solid #F1F0EA" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background="#FAFAF8"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{a.nombre}</div>
                <div style={{ fontSize: 10, color: "#B4B2A9" }}>{a.cat}</div>
              </div>
              <div style={{ fontSize: 10, color: "#B4B2A9", textAlign: "right" }}>
                <div>{a.kcal} kcal</div>
                <div>por 100g</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seleccionado + gramaje */}
      {selected && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ background: "#E1F5EE", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#0F6E56" }}>{selected.nombre}</div>
              <div style={{ fontSize: 10, color: "#5F5E5A" }}>{selected.cat} · {selected.kcal} kcal/100g · P:{selected.prot}g · HC:{selected.hc}g · G:{selected.gras}g</div>
            </div>
            <button onClick={() => { setSelected(null); setQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#1D9E75", fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#5F5E5A", marginBottom: 4 }}>Gramaje (g)</div>
              <input type="number" value={gramos} onChange={e => setGramos(e.target.value)}
                placeholder="Ej: 150"
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6DF", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor="#1D9E75"}
                onBlur={e => e.target.style.borderColor="#E8E6DF"}
                onKeyDown={e => e.key === "Enter" && handleAgregar()} />
            </div>
            <button onClick={handleAgregar} disabled={!gramos || parseFloat(gramos) <= 0}
              style={{ padding: "9px 18px", background: gramos && parseFloat(gramos) > 0 ? "#1D9E75" : "#F1F0EA", color: gramos && parseFloat(gramos) > 0 ? "#fff" : "#B4B2A9", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: gramos ? "pointer" : "not-allowed", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              + Agregar
            </button>
          </div>
          {/* Preview nutricional */}
          {preview && parseFloat(gramos) > 0 && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "#F5F4F0", borderRadius: 9, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Kcal", preview.kcal.toFixed(0)],["HC", `${preview.hc.toFixed(1)}g`],["Prot", `${preview.prot.toFixed(1)}g`],["Grasas", `${preview.gras.toFixed(1)}g`],["Ca", `${preview.ca.toFixed(0)}mg`],["Fe", `${preview.fe.toFixed(1)}mg`]].map(([l,v]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{v}</div>
                  <div style={{ fontSize: 9, color: "#B4B2A9" }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PANEL DE COMIDA ─────────────────────────────────────────────────────────
function MealPanel({ momento, items, onEliminar }) {
  const sub = sumNutrientes(items);
  if (!items.length) return (
    <div style={{ border: "1.5px dashed #E8E6DF", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9" }}>{momento}</div>
      <div style={{ fontSize: 10, color: "#D3D1C7", marginTop: 3 }}>Sin alimentos cargados aún</div>
    </div>
  );
  return (
    <div style={{ border: "1px solid #E8E6DF", borderRadius: 12, overflow: "hidden", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div style={{ background: "#1D9E75", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#fff" }}>{momento}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{sub.kcal.toFixed(0)} kcal · HC {sub.hc.toFixed(1)}g · P {sub.prot.toFixed(1)}g · G {sub.gras.toFixed(1)}g</span>
      </div>
      {items.map((item, i) => {
        const n = calcNutrientes(item.alimento, item.gramos);
        return (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: i < items.length-1 ? "1px solid #F1F0EA" : "none", background: "#fff" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{item.alimento.nombre}</div>
              <div style={{ fontSize: 10, color: "#B4B2A9" }}>{item.gramos}g · {n.kcal.toFixed(0)} kcal · HC {n.hc.toFixed(1)}g · P {n.prot.toFixed(1)}g · G {n.gras.toFixed(1)}g</div>
            </div>
            <Pill label={item.alimento.cat} bg="#F1EFE8" color="#5F5E5A" small />
            <button onClick={() => onEliminar(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D3D1C7", fontSize: 16, padding: "2px 4px", transition: "color 0.1s" }}
              onMouseEnter={e => e.target.style.color="#D85A30"}
              onMouseLeave={e => e.target.style.color="#D3D1C7"}>×</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── PLAN CON DATOS DE EJEMPLO ────────────────────────────────────────────────
const PLAN_INICIAL = [
  { id:1, alimento: ALIMENTOS_DB[0],  gramos: 50,  momento: "Desayuno" },        // Avena
  { id:2, alimento: ALIMENTOS_DB[20], gramos: 200, momento: "Desayuno" },        // Leche desc.
  { id:3, alimento: ALIMENTOS_DB[50], gramos: 100, momento: "Desayuno" },        // Manzana
  { id:4, alimento: ALIMENTOS_DB[30], gramos: 150, momento: "Almuerzo" },        // Lentejas
  { id:5, alimento: ALIMENTOS_DB[40], gramos: 100, momento: "Almuerzo" },        // Espinaca
  { id:6, alimento: ALIMENTOS_DB[42], gramos: 80,  momento: "Almuerzo" },        // Zanahoria
  { id:7, alimento: ALIMENTOS_DB[61], gramos: 10,  momento: "Almuerzo" },        // Aceite oliva
  { id:8, alimento: ALIMENTOS_DB[21], gramos: 200, momento: "Merienda" },        // Yogur
  { id:9, alimento: ALIMENTOS_DB[52], gramos: 150, momento: "Merienda" },        // Naranja
  { id:10,alimento: ALIMENTOS_DB[10], gramos: 150, momento: "Cena" },            // Pollo
  { id:11,alimento: ALIMENTOS_DB[41], gramos: 150, momento: "Cena" },            // Brócoli
  { id:12,alimento: ALIMENTOS_DB[43], gramos: 100, momento: "Cena" },            // Tomate
  { id:13,alimento: ALIMENTOS_DB[63], gramos: 20,  momento: "Colación tarde" },  // Almendras
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NutriPlanAlimentario({ onVolver }) {
  const [plan, setPlan] = useState(PLAN_INICIAL);
  const [nextId, setNextId] = useState(100);
  const [momentoActivo, setMomentoActivo] = useState("Desayuno");
  const [saved, setSaved] = useState(false);

  const agregar = (item) => {
    setPlan(prev => [...prev, { ...item, id: nextId }]);
    setNextId(n => n + 1);
    setMomentoActivo(item.momento);
  };

  const eliminar = (id) => setPlan(prev => prev.filter(i => i.id !== id));

  const totales = useMemo(() => sumNutrientes(plan), [plan]);

  const pctVCT = Math.round((totales.kcal / OBJETIVOS.vct) * 100);
  const pctHC  = Math.round((totales.hc   / OBJETIVOS.hc)  * 100);
  const pctP   = Math.round((totales.prot / OBJETIVOS.prot) * 100);
  const pctG   = Math.round((totales.gras / OBJETIVOS.gras) * 100);

  const distHC   = Math.round((totales.hc   * 4) / Math.max(1, totales.kcal) * 100);
  const distProt = Math.round((totales.prot  * 4) / Math.max(1, totales.kcal) * 100);
  const distGras = Math.round((totales.gras  * 9) / Math.max(1, totales.kcal) * 100);

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", background: "#F5F4F0", minHeight: "100vh", color: "#2C2C2A" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6DF", padding: "0 22px", height: 58, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onVolver} style={{ background: "none", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#5F5E5A", cursor: "pointer", fontFamily: "inherit" }}>← Volver</button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Plan Alimentario — {PACIENTE.nombre}</div>
          <div style={{ fontSize: 10, color: "#B4B2A9" }}>Fórmula desarrollada · VCT objetivo: {OBJETIVOS.vct} kcal</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <Pill label={`${plan.length} alimentos`} bg="#E1F5EE" color="#0F6E56" />
          <Pill label={`${totales.kcal.toFixed(0)} kcal`} bg={pctVCT > 110 ? "#FAECE7" : pctVCT > 90 ? "#E1F5EE" : "#F5F4F0"} color={pctVCT > 110 ? "#712B13" : pctVCT > 90 ? "#0F6E56" : "#5F5E5A"} />
          <button onClick={() => setSaved(true)} style={{ background: "#F5F4F0", border: "1.5px solid #E8E6DF", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 500, color: "#2C2C2A", cursor: "pointer", fontFamily: "inherit" }}>
            Guardar plan
          </button>
          <button onClick={() => generarPDF(plan, totales, OBJETIVOS, PACIENTE, MOMENTOS)}
            style={{ background: "#1D9E75", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            ↓ Generar PDF
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F0EA", padding: "8px 22px", display: "flex", gap: 5, fontSize: 11 }}>
        <span style={{ color: "#B4B2A9" }}>Dashboard</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#B4B2A9" }}>{PACIENTE.nombre}</span>
        <span style={{ color: "#D3D1C7" }}>/</span>
        <span style={{ color: "#0F6E56", fontWeight: 500 }}>Plan Alimentario</span>
      </div>

      <div style={{ padding: "20px", display: "flex", gap: 18, maxWidth: 1200, margin: "0 auto" }}>

        {/* ─── COLUMNA IZQUIERDA: buscador + comidas ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

          <BuscadorAlimentos onAgregar={agregar} momentoActivo={momentoActivo} />

          {/* Comidas */}
          <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Plan por momentos del día</div>
            {MOMENTOS.map(m => (
              <MealPanel key={m} momento={m}
                items={plan.filter(i => i.momento === m)}
                onEliminar={eliminar} />
            ))}
          </div>

        </div>

        {/* ─── COLUMNA DERECHA: métricas sticky ─── */}
        <div style={{ width: 330, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 68, maxHeight: "calc(100vh - 90px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* VCT gauge */}
            <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Fórmula Sintética vs. Desarrollada</div>
                <Pill label={`${pctVCT}%`} bg={pctVCT > 110 ? "#FAECE7" : pctVCT > 90 ? "#E1F5EE" : "#F1EFE8"} color={pctVCT > 110 ? "#712B13" : pctVCT > 90 ? "#0F6E56" : "#5F5E5A"} />
              </div>
              {/* VCT grande */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#2C2C2A" }}>VCT Total</span>
                <span style={{ fontSize: 11, color: "#B4B2A9" }}>Objetivo: {OBJETIVOS.vct} kcal</span>
              </div>
              <div style={{ height: 10, background: "#F1F0EA", borderRadius: 5, overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  height: "100%", borderRadius: 5, transition: "width 0.4s ease",
                  width: `${Math.min(100, pctVCT)}%`,
                  background: pctVCT > 110 ? "#D85A30" : pctVCT > 90 ? "#1D9E75" : "#EF9F27"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 300, color: "#2C2C2A", fontFamily: "Georgia, serif", lineHeight: 1 }}>{totales.kcal.toFixed(0)}</div>
                  <div style={{ fontSize: 10, color: "#B4B2A9" }}>kcal en el plan</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#B4B2A9" }}>
                  <div>Faltan: <strong style={{ color: "#2C2C2A" }}>{Math.max(0, OBJETIVOS.vct - totales.kcal).toFixed(0)} kcal</strong></div>
                </div>
              </div>

              {/* Macros individuales */}
              <MacroBar label="Hidratos de carbono" actual={totales.hc}   objetivo={OBJETIVOS.hc}   color="#EF9F27" />
              <MacroBar label="Proteínas"            actual={totales.prot} objetivo={OBJETIVOS.prot} color="#1D9E75" />
              <MacroBar label="Grasas"               actual={totales.gras} objetivo={OBJETIVOS.gras} color="#378ADD" />

              {/* Distribución % */}
              <div style={{ marginTop: 12, padding: "10px 12px", background: "#F5F4F0", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "#B4B2A9", marginBottom: 6 }}>Distribución calórica</div>
                <div style={{ display: "flex", gap: 0, height: 8, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ flex: distHC,   background: "#EF9F27", transition: "flex 0.4s" }} />
                  <div style={{ flex: distProt,  background: "#1D9E75", transition: "flex 0.4s" }} />
                  <div style={{ flex: distGras,  background: "#378ADD", transition: "flex 0.4s" }} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10 }}>
                  {[["HC", distHC, "#EF9F27"],["Prot", distProt, "#1D9E75"],["Grasas", distGras, "#378ADD"]].map(([l,v,c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                      <span style={{ color: "#5F5E5A" }}>{l}: <strong>{v}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Micronutrientes */}
            <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Micronutrientes críticos</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                <MicroBadge label="Ca" actual={totales.ca}   objetivo={OBJETIVOS.ca}   unit="mg" />
                <MicroBadge label="Fe" actual={totales.fe}   objetivo={OBJETIVOS.fe}   unit="mg" />
                <MicroBadge label="Zn" actual={totales.zn}   objetivo={OBJETIVOS.zn}   unit="mg" />
                <MicroBadge label="B12" actual={totales.b12} objetivo={OBJETIVOS.b12}  unit="µg" />
                <MicroBadge label="Vit D" actual={totales.vitD} objetivo={OBJETIVOS.vitD} unit="µg" />
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", fontSize: 9, color: "#B4B2A9" }}>
                {[["#E1F5EE","#0F6E56","≥85% Adecuado"],["#FAEEDA","#633806","50-84% Bajo"],["#FAECE7","#712B13","<50% Deficiente"]].map(([bg,c,l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: `1px solid ${c}` }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen por comida */}
            <div style={{ background: "#fff", border: "1px solid #E8E6DF", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Distribución por comida</div>
              {MOMENTOS.map(m => {
                const items = plan.filter(i => i.momento === m);
                if (!items.length) return null;
                const sub = sumNutrientes(items);
                const pct = Math.round((sub.kcal / Math.max(1, totales.kcal)) * 100);
                return (
                  <div key={m} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: 500, color: "#2C2C2A" }}>{m}</span>
                      <span style={{ color: "#B4B2A9" }}>{sub.kcal.toFixed(0)} kcal ({pct}%)</span>
                    </div>
                    <div style={{ height: 4, background: "#F1F0EA", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#1D9E75", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F1F0EA", display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ fontWeight: 500, color: "#2C2C2A" }}>Total plan</span>
                <span style={{ fontWeight: 500, color: "#1D9E75" }}>{totales.kcal.toFixed(0)} kcal</span>
              </div>
            </div>

            {/* Botón PDF destacado */}
            <button onClick={() => generarPDF(plan, totales, OBJETIVOS, PACIENTE, MOMENTOS)}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #1D9E75, #0F6E56)", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(29,158,117,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>↓</span>
              Generar PDF para paciente
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
