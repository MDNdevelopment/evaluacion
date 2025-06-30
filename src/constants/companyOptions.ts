import CompanyConfig from "@/components/CompanyConfig";
import CompanyDepartments from "@/components/CompanyDepartments";
import CompanyDownload from "@/components/CompanyDownload";
import CompanyEmployees from "@/components/CompanyEmployees";
import CompanyQuestions from "@/components/CompanyQuestions";

export const COMPANY_OPTIONS = [
  { option: "Configuración", admin: true, component: CompanyConfig },
  {
    option: "Centro de descargas",
    admin: false,
    component: CompanyDownload,
  },
  { option: "Departamentos", admin: true, component: CompanyDepartments },
  { option: "Empleados", admin: true, component: CompanyEmployees },
  {
    option: "Preguntas",
    admin: true,
    component: CompanyQuestions,
  },
];
