import { useEffect, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanyStore, useUserStore } from "@/stores";
import { supabase } from "@/services/supabaseClient";
import getPastMonthRange from "@/utils/getPastMonthRange";
import EvaluationForm from "./EvaluationForm";
import { useNavigate } from "react-router-dom";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";
import { shallow } from "zustand/shallow";

export type Employee = {
  company_id: string;
  departments:
    | { department_id: number; department_name: string }[]
    | { department_id: number; department_name: string };
  first_name: string;
  last_name: string;
  positions: { position_id: number; position_name: string };
  user_id: string;
  evaluation: any;
  access_level: number;
  vacations: { status: string; end_date: Date; start_date: Date }[];
};

export function EmployeesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { firstDay } = getPastMonthRange();
  const [rowSelection, setRowSelection] = useState({});
  const company = useCompanyStore((state) => state.company, shallow);
  const user = useUserStore((state) => state.user, shallow);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setEvaluation = useEvaluationCheckStore((state) => state.setEvaluation);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const loggedUser = employees.find((e) => e.user_id === user?.id);
  console.log({ userVAcations: loggedUser?.vacations });

  const checkVacationOngoing = (vacations: any) => {
    let vacationOngoing = false;

    //Sort the vacationsArray which contains all the vacations records for a specific employee, so that the most recent vacation is on the first position of the array
    const vacationsArray = vacations.sort(
      (a: any, b: any) =>
        new Date(b.end_date).valueOf() - new Date(a.end_date).valueOf()
    );

    const currentMonth = new Date().getMonth() + 1;
    let startDate = null;
    let endDate = null;
    if (vacationsArray.length > 0) {
      startDate = new Date(vacationsArray[0]?.start_date);
      endDate = new Date(vacationsArray?.[0]?.end_date);
      let startDateMonth = startDate.getMonth() + 1;
      let endDateMonth = endDate.getMonth() + 1;

      //If the vacations started before the 15th day of that month or ended after the 15th day of that month, that user won't be evaluated
      if (
        (startDateMonth === currentMonth - 1 && startDate.getDate() <= 15) ||
        (endDateMonth === currentMonth - 1 && endDate.getDate() >= 15)
      ) {
        vacationOngoing = true;
      }
    }
    return vacationOngoing;
  };

  const toggleHandler = (column: any) => {
    const columnName = column.id;
    console.log({ columnName });
    const isSortedAsc = column.getIsSorted() === "asc";
    // Create a new URLSearchParams object
    const newSearchParams = new URLSearchParams(searchParams);

    // Set the new sorting parameter
    newSearchParams.set("column", columnName);
    newSearchParams.set("order", isSortedAsc ? "desc" : "asc");

    // Replace the current search params with the new one
    setSearchParams(newSearchParams);

    return column.toggleSorting(isSortedAsc);
  };

  useEffect(() => {
    getEmployees();
    setEvaluation(null);
    console.log("EmployeesTable Rendered");

    const columnName = searchParams.get("column");
    const order = searchParams.get("order");
    if (columnName && order) {
      setSorting([{ id: columnName, desc: order === "desc" }]);
    }
  }, [company, isLoading]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Nombre
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize pl-3">{row.getValue("first_name")}</div>
      ),
    },
    {
      accessorKey: "last_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Apellido
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize pl-3">{row.getValue("last_name")}</div>
      ),
    },
    {
      accessorKey: "departments",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Departamento
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const department = row.original.departments;
        if (Array.isArray(department)) {
          return department.map((dept) => (
            <div key={dept.department_id}>{dept.department_name}</div>
          ));
        }
        return <div className="pl-3">{department.department_name}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const deptA = rowA.original.departments;
        const deptB = rowB.original.departments;

        const nameA = Array.isArray(deptA)
          ? deptA[0]?.department_name
          : deptA.department_name;
        const nameB = Array.isArray(deptB)
          ? deptB[0]?.department_name
          : deptB.department_name;

        return nameA.localeCompare(nameB);
      },
    },
    {
      id: "position",
      header: "Cargo",
      cell({ row }) {
        return <div>{row.original.positions.position_name}</div>;
      },
    },
    {
      accessorKey: "evaluation_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Evaluaciones hechas
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize  text-center">
          {row.getValue("evaluation_count")}/{employees.length - 1}
        </div>
      ),
    },
    {
      id: "evaluation",
      header: "Evaluación",
      cell: ({ row }) => {
        let vacationOngoing = checkVacationOngoing(row.original.vacations);

        if (
          (user &&
            user.access_level === 1 &&
            row.original.positions.position_name !== "CEO") ||
          row.original.user_id === user?.id ||
          row.original.positions.position_id === user?.position_id ||
          vacationOngoing ||
          checkVacationOngoing(loggedUser?.vacations)
        ) {
          return (
            <Button
              className="bg-white text-darkText border cursor-not-allowed"
              disabled
            >
              {vacationOngoing}
              Evaluar
            </Button>
          );
        }
        return (
          <>
            <EvaluationForm
              userAccessLevel={user?.access_level || null}
              userId={user?.id || ""}
              employeeId={row.original.user_id}
              employeePosition={row.original.positions.position_id.toString()}
              employeeName={`${row.original.first_name} ${row.original.last_name}`}
              setTableIsLoading={setIsLoading}
              evaluationId={row.original.evaluation?.id}
            />
          </>
        );
      },
    },
    {
      id: "status",
      header: "Estado",
      cell({ row }) {
        if (checkVacationOngoing(row.original.vacations)) {
          return (
            <div className="bg-[#9d44f0cd] flex justify-center items-center gap-2 p-1 rounded-md">
              <p className="text-[#ffffff] text-center">Vacaciones</p>
            </div>
          );
        } else if (row.original.evaluation) {
          return (
            <div className="bg-[#3195369f] flex justify-center items-center gap-2 p-1 rounded-md">
              <p className="text-white">Evaluado</p>
            </div>
          );
        } else if (
          user &&
          user.access_level < 1 &&
          row.original.positions.position_name !== "CEO"
        ) {
          return (
            <div className="bg-[#f04444cd] flex justify-center items-center gap-2 p-1 rounded-md">
              <p className="text-[#741313]">No disponible</p>
            </div>
          );
        }
        return (
          <div className="bg-[#f0dc44cd] flex justify-center items-center gap-2 p-1 rounded-md">
            <p className="text-[#746913]">Pendiente</p>
          </div>
        );
      },
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
                  navigate(`/empleado/${row.original.user_id}`, {});
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

  const getEmployees = async () => {
    if (company && user) {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          user_id,
          first_name,
          last_name,
          company_id,
          access_level,
          departments(department_name, department_id),
          positions(position_name, position_id),
         evaluation_count: evaluation_sessions!manager_id(count),
         vacations(start_date, end_date, status)
    `
        )
        .eq("company_id", company.id)
        .eq("evaluation_sessions.period", firstDay);

      console.log({ data });
      if (error) {
        console.log(error.message);
        return;
      }

      //Get the evaluations made by the logged user for this period
      const { data: evaluations, error: errorEvaluations } = await supabase
        .from("evaluation_sessions")
        .select("employee_id, id, period, created_at, manager_id")
        .eq("manager_id", user.id)
        .eq("period", firstDay);

      if (errorEvaluations) {
        console.log(errorEvaluations.message);
        return;
      }

      const employeesList: any = data.map((employee) => {
        const evaluation = evaluations.find(
          (evaluation) => evaluation.employee_id === employee.user_id
        );

        return {
          ...employee,
          evaluation,
          evaluation_count: employee.evaluation_count[0].count || 0,
        };
      });

      //sort the employees by department
      employeesList.sort((a: any, b: any) => {
        const deptA: any = a.departments;
        const deptB: any = b.departments;

        const nameA = Array.isArray(deptA)
          ? deptA[0].department_name
          : deptA.department_name;
        const nameB = Array.isArray(deptB)
          ? deptB[0].department_name
          : deptB.department_name;

        return nameA.localeCompare(nameB);
      });

      setEmployees(employeesList);
      setIsLoading(false);
    } else {
      console.log("no company");
    }
  };

  const table = useReactTable({
    data: employees,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const firstName = row.original.first_name.toLowerCase();
      const lastName = row.original.last_name.toLowerCase();
      const searchValue = filterValue.toLowerCase();
      if (searchValue.indexOf(" ") !== -1) {
        const splitWords = searchValue.split(" ");

        return (
          firstName.includes(splitWords[0]) && lastName.includes(splitWords[1])
        );
      }

      return firstName.includes(searchValue) || lastName.includes(searchValue);
    },
  });

  return (
    <div className="max-w-[1200px] mx-auto ">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar..."
          // value={
          //   (table.getColumn("first_name")?.getFilterValue() as string) ?? ""
          // }
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border  overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4"></div>
    </div>
  );
}
