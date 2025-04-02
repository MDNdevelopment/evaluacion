import { supabase } from "@/services/supabaseClient";
import { useCompanyStore } from "@/stores";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { toast } from "react-toastify";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
import { EditEmployeeDialog } from "./EditEmployeeDialog";

export default function CompanyEmployees() {
  const company = useCompanyStore((state) => state.company, shallow);
  const [employees, setEmployees] = useState<any>(null);
  const [companyDepartments, setCompanyDepartments] = useState<any>(null);
  const [companyPositions, setCompanyPositions] = useState<any>(null);

  const getPositions = async () => {
    if (!company) return;
    const { data, error } = await supabase
      .from("positions")
      .select("position_id, position_name, department_id")
      .eq("company_id", company.id);
    if (error) {
      console.log(error.message);
    }
    console.log(data);
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
    if (!company) return;
    const { data, error } = await supabase
      .from("users")
      .select(
        "*, ...departments(department_name, department_id), ...positions(position_name, position_id)"
      )
      .eq("company_id", company.id);

    if (error) {
      console.log(error.message);
    }

    console.log(data);
    setEmployees(data);
  };

  useEffect(() => {
    console.log("RENDERED COMPANY EMPLOYEES");
    getEmployees();
    getDepartments();
    getPositions();
  }, [company]);

  const handleDeleteEmployee = async (id: string) => {
    console.log(id);
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
      accessorKey: "access_level",
      header: "Nivel de acceso",
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <EditEmployeeDialog
              employeeId={row.original.user_id}
              departments={companyDepartments}
              positions={companyPositions}
              fetchEmployees={getEmployees}
            />
            <DeleteEmployeeDialog
              handleDeleteEmployee={handleDeleteEmployee}
              employeeName={`${row.original.first_name} ${row.original.last_name}`}
              employeeId={row.original.user_id}
            />
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

      <DataTable columns={columns} data={employees} />
    </div>
  );
}
