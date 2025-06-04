import { supabase } from "@/services/supabaseClient";
import { useCompanyStore } from "@/stores";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { toast } from "react-toastify";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
import { EditEmployeeDialog } from "./EditEmployeeDialog";
import AssignVacationsDialog from "./AssignVacationsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VacationsBadge from "./VacationsBadge";

interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
}

export default function CompanyEmployees() {
  const company = useCompanyStore((state) => state.company, shallow);
  const [employees, setEmployees] = useState<any>(null);
  const [companyDepartments, setCompanyDepartments] = useState<any>(null);
  const [companyPositions, setCompanyPositions] = useState<any>(null);
  const [isVacationsDialogOpen, setIsVacationsDialogOpen] =
    useState<boolean>(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] =
    useState<boolean>(false);

  const [isDeleteEmployeeDialogOpen, setIsDeleteEmployeeDialogOpen] =
    useState<boolean>(false);
  const [selectedEmployeeData, setSelectedEmployeeData] =
    useState<Employee | null>(null);

  const [fetchingEmployees, setFetchingEmployees] = useState<boolean>(true);

  const navigate = useNavigate();

  const getPositions = async () => {
    if (!company) return;
    const { data, error } = await supabase
      .from("positions")
      .select("position_id, position_name, department_id")
      .eq("company_id", company.id);
    if (error) {
      console.log(error.message);
    }
    setCompanyPositions(data);
  };
  const getDepartments = async () => {
    if (!company) return;
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("company_id", company.id);
    if (error) {
      console.log(error.message);
    }
    setCompanyDepartments(data);
  };
  const getEmployees = async () => {
    const year = new Date().getFullYear();
    let yearStart = `${year}-01-01`;
    let yearEnd = `${year}-12-31`;
    if (!company) return;
    const { data, error } = await supabase
      .from("users")
      .select(
        "*, ...departments(department_name, department_id), ...positions(position_name, position_id), vacations(status, start_date, end_date)"
      )
      .eq("company_id", company.id)
      .lte("vacations.start_date", yearEnd)
      .gte("vacations.end_date", yearStart);

    if (error) {
      console.log(error.message);
      setFetchingEmployees(false);
      return;
    }
    setFetchingEmployees(false);

    setEmployees(data);
  };

  const setUserDataFromTable = (row: any) => {
    setSelectedEmployeeData({
      user_id: row.original.user_id,
      first_name: row.original.first_name,
      last_name: row.original.last_name,
    });
  };

  useEffect(() => {
    if (fetchingEmployees) {
      getEmployees();
    }
    if (!companyDepartments || companyPositions) {
      getDepartments();
      getPositions();
    }
  }, [company, fetchingEmployees]);

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("user_id", id);
    if (error) {
      console.log(error.message);
      toast.error("Error al eliminar el empleado", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }
    toast.success("Empleado eliminado", {
      position: "bottom-right",
      autoClose: 2000,
    });
    // Refresh the employee list
    getEmployees();
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "first_name",
      header: "Nombre",
    },
    {
      accessorKey: "last_name",
      header: "Apellido",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "department_name",
      header: "Departamento",
    },
    {
      accessorKey: "position_name",
      header: "Puesto",
    },
    {
      header: "Vacaciones",
      cell: ({ row }) => {
        return (
          <VacationsBadge
            vacationStatus={row.original.vacations?.[0]?.status}
            vacationStartDate={row.original.vacations?.[0]?.start_date}
            vacationEndDate={row.original.vacations?.[0]?.end_date}
          />
        );
      },
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    navigate(`/empleado/${row.original.user_id}`);
                  }}
                >
                  Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    setUserDataFromTable(row);
                    setIsVacationsDialogOpen(true);
                  }}
                >
                  Vacaciones
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    setUserDataFromTable(row);
                    setIsEditEmployeeDialogOpen(true);
                  }}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 "
                  onSelect={() => {
                    setUserDataFromTable(row);
                    setIsDeleteEmployeeDialogOpen(true);
                  }}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
  return (
    <div className="mx-auto  w-full">
      <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Empleados
      </h2>

      <div className="">
        <DataTable columns={columns} data={employees} />
      </div>
      <AssignVacationsDialog
        isVacationsDialogOpen={isVacationsDialogOpen}
        setIsVacationsDialogOpen={setIsVacationsDialogOpen}
        employeeId={selectedEmployeeData ? selectedEmployeeData.user_id : null}
        setFetchingEmployees={setFetchingEmployees}
      />
      <EditEmployeeDialog
        employeeId={selectedEmployeeData ? selectedEmployeeData.user_id : null}
        departments={companyDepartments}
        positions={companyPositions}
        fetchEmployees={getEmployees}
        isEditEmployeeDialogOpen={isEditEmployeeDialogOpen}
        setIsEditEmployeeDialogOpen={setIsEditEmployeeDialogOpen}
      />
      <DeleteEmployeeDialog
        isDeleteEmployeeDialogOpen={isDeleteEmployeeDialogOpen}
        setIsDeleteEmployeeDialogOpen={setIsDeleteEmployeeDialogOpen}
        handleDeleteEmployee={handleDeleteEmployee}
        employeeName={`${selectedEmployeeData?.first_name} ${selectedEmployeeData?.last_name}`}
        employeeId={selectedEmployeeData ? selectedEmployeeData.user_id : null}
      />
    </div>
  );
}
