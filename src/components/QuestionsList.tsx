import { useEffect, useState } from "react";

import { supabase } from "@/services/supabaseClient";
import { Company, Position, Question } from "@/types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@headlessui/react";
import { FaLeftLong, FaRightLong } from "react-icons/fa6";
import { QuestionDialog } from "./QuestionDialog";
import { FaTrash } from "react-icons/fa";

export default function QuestionsList({
  questions,
  setFetchingQuestions,
  company,
  positions,
}: {
  questions: Question[];
  setFetchingQuestions: React.Dispatch<React.SetStateAction<boolean>>;
  company: Company;
  positions: { [key: string]: Position[] };
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [itemsPerPage, _setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>(
    questions.slice(0, 10)
  );

  useEffect(() => {
    if (questions.length > 0) {
      setDisplayedQuestions(questions.slice(0, 10));
    }
  }, [questions]);
  const handleDeleteQuestion = async (questionId: number) => {
    // delete question from the database
    const response = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);
    if (response.error) {
      console.log(response.error.message);
      return;
    }

    console.log(response);

    toast.success("Pregunta eliminada correctamente", {
      position: "bottom-right",
    });

    setFetchingQuestions(true);

    return;
  };

  const handlePageDown = () => {
    if (currentPage === 0) {
      return;
    }
    const newPage = currentPage - 1;
    const start = newPage * 10;
    const end = start + 9;
    console.log({ start, end });
    setDisplayedQuestions(questions.slice(start, end));
    console.log(questions.slice(start, end));
    setCurrentPage(newPage);
  };

  const handlePageUp = () => {
    if (currentPage === Math.ceil(questions.length / 10) - 1) {
      return;
    }
    const newPage = currentPage + 1;
    const start = newPage * 10;
    const end = start + 9;
    console.log({ start, end });
    setDisplayedQuestions(questions.slice(start, end));
    console.log(questions.slice(start, end));
    setCurrentPage(newPage);
  };

  const columns: ColumnDef<Question>[] = [
    {
      accessorFn: (row) => row.text,
      accessorKey: "question",
      header: () => {
        return (
          <Button
            variant="ghost"
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pregunta
            {/* <ArrowUpDown /> Disable sorting for this column */}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize pl-3 w-full flex flex-col items-start">
          P: {row.original.text}
          <div className="mt-4">
            <div className="flex flex-row fles-wrap">
              {row.original.tags.length > 0 &&
                row.original.tags.map((tag) => {
                  return <Tag key={tag.id} text={tag.tag} />;
                })}
            </div>
          </div>
        </div>
      ),
    },

    {
      accessorFn: (row) => row.positions.length,
      accessorKey: "positions",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cargos
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize pl-3  text-xs">
          {row.getValue("positions")}
        </div>
      ),
    },

    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <div className="flex flex-row justify-between">
            <QuestionDialog
              company={company}
              setFetchingQuestions={setFetchingQuestions}
              positions={positions}
              questionId={row.original.id}
            />
            <Button
              onClick={() => handleDeleteQuestion(row.original.id)}
              variant="ghost"
              className="text-red-700 hover:text-red-800"
            >
              <FaTrash />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: displayedQuestions,
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
      const question = row.original.text.toLowerCase();
      const searchValue = filterValue.toLowerCase();

      return question.includes(searchValue);
    },
  });

  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-row justify-between items-end py-4 ">
          <Input
            placeholder="Buscar..."
            onChange={(event) => {
              setDisplayedQuestions(
                questions.filter((question) =>
                  question.text
                    .toLowerCase()
                    .includes(event.target.value.toLowerCase())
                )
              );
              return table.setGlobalFilter(event.target.value);
            }}
            className="max-w-sm border border-gray-300 rounded-md px-2 py-1"
          />
          <div className=" text-center">
            <Button
              onClick={() => {
                handlePageDown();
              }}
              variant="outline"
              className="ml-2"
            >
              <FaLeftLong />
            </Button>
            <Button
              onClick={() => {
                handlePageUp();
              }}
              variant="outline"
              className="ml-2"
            >
              <FaRightLong />
            </Button>
            <p>
              Página {currentPage + 1} de {Math.ceil(questions.length / 10)}
            </p>
          </div>

          {/* <DropdownMenu>
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
          </DropdownMenu> */}
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
    </>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <div className="bg-gray-300 text-gray-800 text-center flex items-center justify-center text-[.75em] w-fit px-3 py-[0.1rem] rounded-sm mx-1">
      {text}
    </div>
  );
}

/*

<div className="w-full mt-5 pr-4 overflow-y-scroll max-h-[50rem]">
      {questions.map((question) => (
        <div
          key={question.id}
          className="border-t  border-gray-300 p-3 flex  flex-row flex-wrap items-center justify-between"
        >
          <div>
            <span className="w-4/6 font-medium ">{question.text}</span>
            <div>
              {question.tags.length > 0 && (
                <div className="w-full  flex flex-col items-start mt-3">
                  <span className="text-xs font-medium text-italic mb-1 ">
                    Etiquetas:
                  </span>
                  <div className="flex flex-row flesx-wrap">
                    {question.tags.length > 0 &&
                      question.tags.map((tag) => {
                        return <Tag key={tag.id} text={tag.tag} />;
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-1/6 items-start">
            <div>
              <p className="text-xs my-1">
                <span className="font-bold">Se aplica a: </span>
                {question.positions.length} cargos
              </p>
            </div>
            <div className="flex flex-row w-full justify-start ">
              <FaPencilAlt />
              <FaTrashAlt
                className="cursor-pointer"
                onClick={() => handleDeleteQuestion(question.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
    */
