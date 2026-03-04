import { useEffect, useState, useMemo } from "react";
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
import { useUserStore } from "@/stores";
import EvaluationsMadeDialog from "../components/EvaluationsMadeDialog";

export default function Summary() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, watch } = useForm();

  const month = watch("month");
  const year = watch("year");
  const periodDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const columns: ColumnDef<any>[] = useMemo(() => {
    const base: ColumnDef<any>[] = [
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
        header: "Dept.",
        enableSorting: true,
      },
      {
        accessorKey: "total_score",
        header: "Puntaje Total",
        enableSorting: true,
      },
      {
        accessorKey: "evaluation_count",
        header: `Eval. recibidas`,
        enableSorting: true,
      },
    ];

    // only show evaluated_others_count for admins
    if (user?.admin) {
      base.push({
        accessorKey: "evaluated_others_count",
        header: "Eval. hechas",
        enableSorting: true,
        cell: ({ row }) => (
          <Button
            className="underline "
            variant="ghost"
            onClick={() => {
              setSelectedManager(row.original.user_id);
              setIsDialogOpen(true);
            }}
          >
            {row.original.evaluated_others_count}
          </Button>
        ),
      });
    }

    base.push({
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
    });

    return base;
  }, [user, navigate]);

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
      <EvaluationsMadeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        managerId={selectedManager || ""}
        period={periodDate}
      />
    </div>
  );
}
