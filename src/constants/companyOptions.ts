import CompanyConfig from "@/components/CompanyConfig";
import CompanyDepartments from "@/components/CompanyDepartments";
import CompanyDownload from "@/components/CompanyDownload";
import CompanyEmployees from "@/components/CompanyEmployees";

export const COMPANY_OPTIONS = [
  { option: "Configuración", role: "admin", component: CompanyConfig },
  {
    option: "Centro de descargas",
    role: "employee",
    component: CompanyDownload,
  },
  { option: "Departamentos", role: "admin", component: CompanyDepartments },
  { option: "Empleados", role: "admin", component: CompanyEmployees },
];
