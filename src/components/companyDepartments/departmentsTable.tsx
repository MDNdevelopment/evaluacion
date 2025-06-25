import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import DepartmentDialog from "./DepartmentDialog";

interface Department {
  department_id: number;
  department_name: string;
  users: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  }[];
  positions: {
    position_id: number;
    position_name: string;
  }[];
}

export default function DepartmentsTable({
  departments,
  departmentAvg,
  refetch,
  company,
}: {
  departments: Department[];
  departmentAvg: any;
  refetch: () => void;
  company: any;
}) {
  //Table states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, _setColumnVisibility] = useState<VisibilityState>(
    {}
  );
  const [searchDepartment, setSearchDepartment] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  //Other states
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const columnName = searchParams.get("column");
    const order = searchParams.get("order");
    if (columnName && order) {
      setSorting([{ id: columnName, desc: order === "desc" }]);
    }
  }, []);

  const toggleHandler = (column: any) => {
    const columnName = column.id;
    console.log({ columnName });
    const isSortedAsc = column.getIsSorted() === "asc";
    console.log(isSortedAsc);
    // Create a new URLSearchParams object
    const newSearchParams = new URLSearchParams(searchParams);

    // Set the new sorting parameter
    newSearchParams.set("column", columnName);
    newSearchParams.set("order", isSortedAsc ? "desc" : "asc");

    // Replace the current search params with the new one
    setSearchParams(newSearchParams);

    return column.toggleSorting(isSortedAsc);
  };
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "department_name",
      header: ({ column }) => {
        return (
          <Button
            disabled={departments.length === 0 || !column.getCanSort()}
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
      cell: ({ row }) => (
        <div className=" ">{row.original.department_name}</div>
      ),
    },

    {
      accessorKey: "positions",
      header: ({ column }) => {
        return (
          <Button
            disabled={departments.length === 0 || !column.getCanSort()}
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Cargos
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const positions = row.original.positions.length;

        return <div className="  ">{positions}</div>;
      },
      sortingFn: (rowA, rowB) =>
        rowA.original.positions.length - rowB.original.positions.length,
    },
    {
      accessorKey: "totalEmployees",
      id: "totalEmployees",
      header: ({ column }) => {
        return (
          <Button
            disabled={departments.length === 0 || !column.getCanSort()}
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Empleados
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const totalEmployees = row.original.users.length;
        return <div className="text-center ">{totalEmployees}</div>;
      },
      sortingFn: (rowA, rowB) =>
        rowA.original.users.length - rowB.original.users.length,
    },
    {
      id: "avgScore",
      accessorKey: "avgScore",
      header: ({ column }) => {
        return (
          <Button
            disabled={departments.length === 0 || !column.getCanSort()}
            variant="ghost"
            onClick={() => {
              toggleHandler(column);
            }}
          >
            Promedio
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const departmentId = row.original.department_id;
        const avgScore = departmentAvg[departmentId]?.avg_score || 0;
        return (
          <div className="text-center">
            {avgScore ? avgScore.toFixed(2) : 0}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const scoreA =
          departmentAvg[rowA.original.department_id]?.avg_score || 0;
        const scoreB =
          departmentAvg[rowB.original.department_id]?.avg_score || 0;
        return scoreA - scoreB;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigate(
                    `/organizacion/departamentos/${row.original.department_id}`,
                    { state: row.original }
                  );
                }}
              >
                Editar departamento
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  navigate(
                    `/organizacion/departamentos/${row.original.department_id}`,
                    {
                      state: { targetId: "employees" },
                    }
                  );
                }}
              >
                Ver empleados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: departments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter: searchDepartment,
    },
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      return row.original.department_name
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4 lg:px-0 px-10 mb-5 lg:flex-row lg:justify-between lg:items-center">
        <div className="lg:w-1/4">
          <span className="text-neutral-800 text-sm font-light">
            Buscar departamento
          </span>
          <Input
            value={searchDepartment}
            onChange={(e) => setSearchDepartment(e.target.value)}
          />
        </div>

        <DepartmentDialog
          mode="create"
          company={{ id: company?.id, name: company?.name }}
          refetch={refetch}
        />
      </div>
      <div className="rounded-md border  overflow-x-auto ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-center " key={header.id}>
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
            {departments.length && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  className={`${
                    index % 2 !== 0 ? "bg-neutral-50" : ""
                  } hover:bg-neutral-100`}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={`text-center `} key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-white">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center "
                >
                  {searchDepartment
                    ? "No se encontraron departamentos que coincidan con la búsqueda"
                    : "No hay departamentos disponibles."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {departments.length > 0 && (
        <div className="flex lg:flex-row flex-col gap-4 lg:gap-0 items-center justify-between space-x-2 py-4 px-5">
          <div className="flex items-center justify-between mt-4 gap-2">
            <span className="text-sm text-neutral-600">
              Página {pagination.pageIndex + 1} de{" "}
              {Math.ceil(departments.length / pagination.pageSize)}
              {"."}
            </span>
            <span className="text-sm text-neutral-600">
              Departamentos: {departments.length}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
