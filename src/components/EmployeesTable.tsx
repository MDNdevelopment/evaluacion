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
import { CheckEvaluation } from "./CheckEvaluation";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";

export type Employee = {
  company_id: string;
  departments: { id: number; name: string }[] | { id: number; name: string };
  first_name: string;
  last_name: string;
  positions: { id: number; name: string };
  user_id: string;
  evaluation: any;
};

export function EmployeesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { firstDay } = getPastMonthRange();
  const [rowSelection, setRowSelection] = useState({});
  const company = useCompanyStore((state) => state.company);
  const user = useUserStore((state) => state.user);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setEvaluation = useEvaluationCheckStore((state) => state.setEvaluation);
  const navigate = useNavigate();

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Departamento
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const department = row.original.departments;
        if (Array.isArray(department)) {
          return department.map((dept) => <div key={dept.id}>{dept.name}</div>);
        }
        return <div className="pl-3">{department.name}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const deptA = rowA.original.departments;
        const deptB = rowB.original.departments;

        const nameA = Array.isArray(deptA) ? deptA[0]?.name : deptA.name;
        const nameB = Array.isArray(deptB) ? deptB[0]?.name : deptB.name;

        return nameA.localeCompare(nameB);
      },
    },
    {
      id: "position",
      header: "Cargo",
      cell({ row }) {
        return <div>{row.original.positions.name}</div>;
      },
    },
    {
      id: "evaluation",
      header: "Evaluación",
      cell: ({ row }) => {
        const evaluation = row.original.evaluation;
        return evaluation?.id ? (
          <CheckEvaluation
            evaluationId={evaluation.id}
            setIsLoadingTable={setIsLoading}
            employeeData={{
              name: `${row.original.first_name} ${row.original.last_name}`,
              position: row.original.positions.name,
              department: Array.isArray(row.original.departments)
                ? row.original.departments[0].name
                : row.original.departments.name,
            }}
          />
        ) : (
          <EvaluationForm
            userId={row.original.user_id}
            userPosition={row.original.positions.id.toString()}
            userName={`${row.original.first_name} ${row.original.last_name}`}
            setTableIsLoading={setIsLoading}
          />
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
          departments(name, id),
          positions(name, id)
        `
        )
        .eq("company_id", company.id);

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
        };
      });

      //sort the employees by department
      employeesList.sort((a: any, b: any) => {
        const deptA: any = a.departments;
        const deptB: any = b.departments;

        const nameA = Array.isArray(deptA) ? deptA[0].name : deptA.name;
        const nameB = Array.isArray(deptB) ? deptB[0].name : deptB.name;

        return nameA.localeCompare(nameB);
      });

      setEmployees(employeesList);
      setIsLoading(false);
    } else {
      console.log("no company");
    }
  };

  useEffect(() => {
    getEmployees();
    setEvaluation(null);
  }, [company, isLoading]);

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
    <div className="max-w-[1200px] mx-auto">
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
      <div className="rounded-md border">
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
