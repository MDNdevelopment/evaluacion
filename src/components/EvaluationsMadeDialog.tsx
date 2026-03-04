import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import Spinner from "./Spinner";

interface EvaluationsMadeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  managerId: string;
  period: string; // e.g., "2024-01-01"
}

interface EvaluatedEmployee {
  employee_id: string;
  first_name: string;
  last_name: string;
  position_name: string;
  department_name: string;
  evaluation_date: string;
}

export default function EvaluationsMadeDialog({
  isOpen,
  onClose,
  managerId,
  period,
}: EvaluationsMadeDialogProps) {
  const [data, setData] = useState<EvaluatedEmployee[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<EvaluatedEmployee>[] = [
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
      accessorKey: "evaluation_date",
      header: "Fecha de Evaluación",
      enableSorting: true,
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return new Date(date).toLocaleDateString();
      },
    },
  ];

  useEffect(() => {
    if (isOpen && managerId && period) {
      fetchEvaluations();
    }
  }, [isOpen, managerId, period]);

  const fetchEvaluations = async () => {
    setIsLoading(true);

    // simple select query joining to users table for employee info
    const { data: evalRows, error } = await supabase
      .from("evaluation_sessions")
      .select(
        `
        employee_id,
        created_at,
        users!employee_id(
          first_name,
          last_name,
          departments(department_name), positions(position_name)
        )
        
      `,
      )
      .eq("manager_id", managerId)
      .eq("period", period);

    if (error) {
      console.error("Error fetching evaluations made by manager:", error);
      setData([]);
    } else if (evalRows) {
      const formatted = evalRows.map((row: any) => ({
        employee_id: row.employee_id,
        first_name: row.users?.first_name || "",
        last_name: row.users?.last_name || "",
        position_name: row.users?.positions?.position_name || "",
        department_name: row.users?.departments.department_name || "",
        evaluation_date: row.created_at,
      }));
      setData(formatted);
    } else {
      setData([]);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Evaluaciones Realizadas</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className=" max-h-[60vh] overflow-auto">
            <DataTable columns={columns} data={data || []} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
