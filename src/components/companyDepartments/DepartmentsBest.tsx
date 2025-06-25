import { Frown } from "lucide-react";
import { Separator } from "../ui/separator";
import Spinner from "../Spinner";

interface DepartmentsBestProps {
  bestDepartment: {
    name: string;
    user_count: number;
    avg_score: number;
  };
}

export default function DepartmentsBest({
  bestDepartment,
}: DepartmentsBestProps) {
  if (bestDepartment === undefined) {
    return (
      <div className="h-36 w-full flex items-center justify-center border border-neutral-200 rounded-md">
        <span className="text-neutral-500 flex gap-3 items-center">
          <Spinner /> Calculando el mejor departamento...
        </span>
      </div>
    );
  }

  if (bestDepartment === null) {
    return (
      <div className="h-36 w-full flex items-center justify-center border border-neutral-200 rounded-md">
        <span className="text-neutral-500 flex flex-row gap-3 items-center text-center">
          <Frown /> No podemos saber cuál es el mejor departamento
        </span>
      </div>
    );
  }
  return (
    <div className="lg:h-36 w-full border border-neutral-200 rounded-md px-5 py-3 flex flex-col">
      <div className="flex lg:flex-row flex-col gap-4 w-full items-center h-full px-3 py-2 ">
        <div className="flex flex-col justify-center  w-full ">
          <span className="font-black uppercase text-3xl text-neutral-700 flex-1">
            {bestDepartment.name}
          </span>
          <div className="flex-1 flex-col flex py-1 gap-3 ">
            <div className="flex flex-col w-4/5">
              {" "}
              <span className="text-sm font-light">Mejor departamento</span>
              <span className="italic text-neutral-400 text-xs">
                Basado en promedio y cantidad de empleados
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-row  lg:justify-between justify-center w-full  gap-5">
          <div className="flex flex-col justify-center items-center   ">
            <span className="text-base font-light">Empleados:</span>
            <span className="font-black text-5xl text-neutral-700 self-end pr-5">
              {bestDepartment.user_count}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3/5 my-auto" />
          <div className="flex flex-col justify-center items-center  ">
            <span className="text-base font-light">Promedio:</span>
            <span className="font-black text-5xl text-neutral-700 self-end pr-5">
              {bestDepartment.avg_score.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
