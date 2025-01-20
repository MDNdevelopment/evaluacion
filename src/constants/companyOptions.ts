import {
  CompanyConfig,
  CompanyDepartments,
  CompanyDownload,
  CompanyEmployees,
} from "@/components";

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
