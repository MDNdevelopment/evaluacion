import SidebarTrigger from "./sidebar-trigger";
import { useLocation } from "react-router-dom";

export default function PageHeader() {
  const location = useLocation();

  const pageNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/empleados": "Evaluar",
    "/resumen": "Resumen",
    "/empleado/": "Perfil del Empleado",
    "/ajustes": "Ajustes",
    "/Organización": "Mi Organización",
    "/organizacion/configuracion": "Configuración de la Organización",
    "/organizacion/empleados": "Empleados de la Organización",
    "/organizacion/departamentos": "Departamentos de la Organización",
    "/organizacion/preguntas": "Preguntas de la Organización",
    "/organizacion/descargas": "Descargas de la Organización",
    "/dashboard/nuevo": "Agregar Empleado",
    // ...add other routes
  };
  const pageName = pageNames[location.pathname] || "";
  return (
    <div className="p-2 bg-neutral-100 shadow-sm flex flex-row items-center justify-start border-b-2 border-neutral-200">
      <SidebarTrigger />
      <div className="max-w-[1200px] ">
        <h1 className=" text-lg  font-medium text-neutral-800">{pageName}</h1>
      </div>
    </div>
  );
}
