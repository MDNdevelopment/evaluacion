import Spinner from "../Spinner";
import { Separator } from "../ui/separator";
import { SearchX } from "lucide-react";

interface DepartmentsInfoProps {
  companyInfo?: {
    departments: number;
    employees: number;
    positions: number;
  } | null;
}

export default function DepartmentsInfo({ companyInfo }: DepartmentsInfoProps) {
  if (companyInfo === undefined) {
    return (
      <div className="h-36 w-full flex items-center justify-center border border-neutral-200 rounded-md">
        <span className="text-neutral-500 flex gap-3 items-center">
          <Spinner /> Cargando información...
        </span>
      </div>
    );
  }

  if (companyInfo === null) {
    return (
      <div className="h-36 w-full flex items-center justify-center border border-neutral-200 rounded-md">
        <span className="text-neutral-500 flex flex-row gap-3 items-center">
          <SearchX /> No hay información disponible
        </span>
      </div>
    );
  }
  return (
    <div className="h-36 w-full flex flex-col justify-center border  border-neutral-200 rounded-md ">
      <div className="flex-none  flex flex-row p-1 px-5 gap-5 h-full">
        <div className="flex flex-col justify-center  flex-1 ">
          <span className="text-base font-light">Departamentos:</span>
          <span className="font-black text-4xl text-neutral-700 self-end pr-5">
            {companyInfo.departments}
          </span>
        </div>
        <Separator orientation="vertical" className="h-3/5 my-auto" />
        <div className="flex flex-col justify-center  flex-1 ">
          <span className="text-base font-light">Cargos:</span>
          <span className="font-black text-4xl text-neutral-700 self-end pr-5">
            {companyInfo.positions}
          </span>
        </div>
        <Separator orientation="vertical" className="h-3/5 my-auto" />
        <div className="flex flex-col justify-center  flex-1 ">
          <span className="text-base font-light">Empleados:</span>
          <span className="font-black text-4xl text-neutral-700 self-end pr-5">
            {companyInfo.employees}
          </span>
        </div>
      </div>
    </div>
  );
}
