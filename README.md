# ✦ NutriApp — Sistema de Gestión Nutricional

App web progresiva (PWA) para nutricionistas. Desarrollada con React + Vite, base de datos en Supabase.

---

## Módulos incluidos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Lista de pacientes, métricas, pacientes del día |
| **Ingreso / Anamnesis** | Historia clínica completa en 4 secciones |
| **Seguimiento** | Timeline C1–C5 con gráficos de evolución |
| **Antropometría** | ISAK Nivel 2, Ross & Kerr, Somatocarta Heath-Carter |
| **Plan Alimentario** | Buscador de alimentos, macros+micros en tiempo real, PDF profesional |

---

## Puesta en marcha rápida

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiá el archivo `.env.example` y renombralo `.env`:

```bash
cp .env.example .env
```

Editá `.env` con tus claves de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### 3. Crear las tablas en Supabase

En el SQL Editor de Supabase, pegá y ejecutá el contenido de `supabase_tablas.sql`.

### 4. Levantar en modo desarrollo

```bash
npm run dev
```

La app abre en http://localhost:3000

### 5. Build para producción

```bash
npm run build
```

---

## Deploy en Vercel

1. Subí este repositorio a GitHub
2. En vercel.com → New Project → importá el repo
3. Agregá las variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`)
4. Deploy ✓

Ver guía completa: `NutriApp_Guia_Deploy.docx`

---

## Estructura del proyecto

```
nutriapp/
├── src/
│   ├── App.jsx                          # Enrutador principal
│   ├── main.jsx                         # Entry point
│   ├── index.css                        # Reset global
│   ├── lib/
│   │   ├── supabase.js                  # Cliente DB + helpers
│   │   └── formulas.js                  # Fórmulas nutricionales
│   └── modules/
│       ├── Dashboard/
│       ├── Ingreso/
│       ├── Seguimiento/
│       ├── Antropometria/
│       └── PlanAlimentario/
├── public/
│   ├── manifest.json                    # PWA config
│   └── favicon.svg
├── supabase_tablas.sql                  # Script para crear las tablas
├── .env.example                         # Template de variables de entorno
├── package.json
└── vite.config.js
```

---

## Fórmulas implementadas

- **Composición corporal**: Durnin-Womersley (1974), Ross & Kerr 5 componentes (1993)
- **Masa ósea**: Rocha (1975)
- **Masa residual**: Würch (1974)  
- **Somatotipo**: Heath-Carter (1990)
- **Gasto energético**: Harris-Benedict revisada, Mifflin-St Jeor (1990)
- **Validaciones ISAK**: rangos nivel 1 y nivel 2

---

Desarrollado para la **Lic. Micaela Russo** · M.P. 8432
