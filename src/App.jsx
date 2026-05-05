import { useState } from "react";
import NutriDashboard       from "./modules/Dashboard/NutriApp_Dashboard";
import NutriIngreso         from "./modules/Ingreso/NutriApp_Ingreso";
import NutriSeguimiento     from "./modules/Seguimiento/NutriApp_Seguimiento";
import NutriAntropometria   from "./modules/Antropometria/NutriApp_Antropometria";
import NutriPlanAlimentario from "./modules/PlanAlimentario/NutriApp_PlanAlimentario";

const VISTAS = {
  dashboard:     "dashboard",
  ingreso:       "ingreso",
  seguimiento:   "seguimiento",
  antropometria: "antropometria",
  plan:          "plan",
};

export default function App() {
  const [vista, setVista]    = useState(VISTAS.dashboard);
  const [pacienteId, setPId] = useState(null);

  const ir = (v, pid = null) => {
    setVista(v);
    if (pid) setPId(pid);
  };

  switch (vista) {
    case VISTAS.ingreso:
      return (
        <NutriIngreso
          onVolver={() => ir(VISTAS.dashboard)}
          onIrAntropometria={() => ir(VISTAS.antropometria)}
        />
      );
    case VISTAS.seguimiento:
      return (
        <NutriSeguimiento
          pacienteId={pacienteId}
          onVolver={() => ir(VISTAS.dashboard)}
        />
      );
    case VISTAS.antropometria:
      return (
        <NutriAntropometria
          pacienteId={pacienteId}
          onVolver={() => ir(VISTAS.dashboard)}
          onIrPlan={() => ir(VISTAS.plan)}
        />
      );
    case VISTAS.plan:
      return (
        <NutriPlanAlimentario
          pacienteId={pacienteId}
          onVolver={() => ir(VISTAS.dashboard)}
        />
      );
    default:
      return (
        <NutriDashboard
          onNuevoPaciente={()    => ir(VISTAS.ingreso)}
          onVerPaciente={(id)    => ir(VISTAS.seguimiento, id)}
          onVerAntropometria={(id) => ir(VISTAS.antropometria, id)}
          onVerPlan={(id)        => ir(VISTAS.plan, id)}
        />
      );
  }
}
