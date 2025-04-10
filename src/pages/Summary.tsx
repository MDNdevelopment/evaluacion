import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export default function Summary() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, watch } = useForm();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "first_name",
      header: "Nombre",
      enableSorting: true,
    },
    {
      accessorKey: "last_name",
      header: "Apellido",
      enableSorting: true,
    },
    {
      accessorKey: "position_name",
      header: "Cargo",
      enableSorting: true,
    },
    {
      accessorKey: "department_name",
      header: "Departamento",
      enableSorting: true,
    },
    {
      accessorKey: "total_score",
      header: "Total",
      enableSorting: true,
    },
    {
      accessorKey: "evaluation_count",
      header: "Evaluaciones",
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  //take user to the employee profile
                  navigate(`/empleado/${row.original.user_id}`, {
                    replace: true,
                  });
                }}
                className="cursor-pointer"
              >
                Ver empleado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const onSubmit = handleSubmit(async (data: any) => {
    setIsLoading(true);
    const periodDate = `${data.year}-${String(data.month).padStart(2, "0")}-01`;
    const { data: periodData, error } = await supabase.rpc("summary", {
      period_param: periodDate,
    });

    if (error) {
      console.error("Error fetching evaluation summary:", error);
      return null;
    }
    if (periodData.length === 0) {
      console.log("No data found");
      setData(null);
      setIsLoading(false);
    }

    setData(periodData);

    setIsLoading(false);
  });

  useEffect(() => {
    onSubmit();
  }, [watch("month"), watch("year")]);

  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-100 mt-10 shadow-md rounded-lg">
      <h1 className="text-primary text-4xl uppercase font-black">
        Resumen de evaluaciones
      </h1>
      <form className=" w-full flex justify-center mt-5">
        <select
          className="cursor-pointer py-2 px-4 mx-1 bg-white"
          {...register("month")}
        >
          <option value={1} selected>
            Enero
          </option>
          <option value={2}>Febrero</option>
          <option value={3}>Marzo</option>
          <option value={4}>Abril</option>
          <option value={5}>Mayo</option>
          <option value={6}>Junio</option>
          <option value={7}>Julio</option>
          <option value={8}>Agosto</option>
          <option value={9}>Septiembre</option>
          <option value={10}>Octubre</option>
          <option value={11}>Noviembre</option>
          <option value={12}>Diciembre</option>
        </select>

        <select
          className="cursor-pointer py-2 px-4 mx-1 bg-white"
          {...register("year")}
        >
          {Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (
            <option key={2024 + i} value={2024 + i} selected={i === 1}>
              {2024 + i}
            </option>
          ))}
        </select>
      </form>

      {/* <div className="overflow-x-auto">
        <table className="overflow-x-auto mt-5 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className="">
              <th scope="col" className="px-6 py-3 text-center">
                Nombre y apellido
              </th>
              <th
                onClick={() => sortDepartments()}
                scope="col"
                className="px-6 py-3 text-center cursor-pointer"
              >
                <div className="flex flex-row items-center justify-between">
                  <p>Departamento</p>{" "}
                  <FaAngleDown
                    className={`d-block
                        ${departmentsDirection ? " " : " rotate-180"}
                      `}
                  />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Rol
              </th>
              <th
                onClick={() => sortEvaluations()}
                scope="col"
                className="px-6 py-3 text-center cursor-pointer  "
              >
                <div className="flex flex-row items-center justify-between">
                  <p>Evaluaciones</p>{" "}
                  <FaAngleDown
                    className={`d-block
                        ${evaluationsDirection ? " " : " rotate-180"}
                      `}
                  />
                </div>
              </th>
              <th
                onClick={() => sortAverages()}
                scope="col"
                className="px-6 py-3 text-center cursor-pointer"
              >
                <div className="flex flex-row items-center justify-between">
                  <p>Promedio</p>{" "}
                  <FaAngleDown
                    className={`d-block
                        ${averagesDirection ? " " : " rotate-180"}
                      `}
                  />
                </div>
              </th>

              <th>Acción</th>
            </tr>
          </thead>

          {!isLoading && data && data.length > 0 && (
            <tbody className="relative">
              {data.map((employee: any) => {
                console.log(employee);
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={employee.user_id}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {`${employee.first_name} ${employee.last_name}`}
                    </th>
                    <td className="px-6 py-4">{employee.department_name}</td>

                    <td className="px-6 py-4">{employee.position_name}</td>
                    <td className="px-6 py-4 text-center">
                      {employee.evaluation_count}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {employee.average_total_rate.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-row  ">
                        <FaUser
                          color="#222222"
                          size={22}
                          className="mx-2 cursor-pointer"
                          onClick={() => {
                            navigate(`/empleado/${employee.target_employee}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div> */}

      {isLoading ? (
        <div>
          <div className="bg-white flex justify-center items-center w-full py-5 mt-2">
            <Spinner />
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-md  overflow-hidden">
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </div>
  );
}
