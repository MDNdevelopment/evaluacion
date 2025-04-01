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
import { ArrowUpDown } from "lucide-react";
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
  company,
  positions,
}: {
  company: Company;
  positions: { [key: string]: Position[] };
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [_itemsPerPage, _setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [fetchingQuestions, setFetchingQuestions] = useState(true);

  const fetchQuestions = async () => {
    console.log("fetching questions");
    const { data, error } = await supabase
      .from("questions")
      .select(
        "*, positions:question_positions(...positions(id, name)),tags:question_tags(id, tag)"
      )
      .eq("company_id", company.id);

    if (error) {
      console.log(error.message);
      return;
    }
    if (data && data.length > 0) {
      console.log(data);
      //sort the questions based on the creation date, newest first
      const sortedQuestions = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log(sortedQuestions);
      setQuestions(sortedQuestions);
      setDisplayedQuestions(data.slice(0, 10));
      return;
    }
    setQuestions([]);
    setDisplayedQuestions([]);
  };

  useEffect(() => {
    console.log("MOUNTING QUESTION LIST");
    if (fetchingQuestions) {
      fetchQuestions();
      setFetchingQuestions(false);
      setCurrentPage(0);
    }
  }, [company, fetchingQuestions]);

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
      autoClose: 1000,
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
        <div className=" pl-3 w-full flex flex-col items-start">
          {row.original.text}
          <div className="mt-4">
            <div className="flex flex-row fles-wrap">
              {(row.original.tags ?? []).length > 0 &&
                (row.original.tags ?? []).map((tag) => {
                  return <Tag key={tag.id} text={tag.tag} />;
                })}
            </div>
          </div>
        </div>
      ),
    },

    {
      accessorFn: (row) => (row.positions ?? []).length,
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
      <QuestionDialog
        company={company}
        setFetchingQuestions={setFetchingQuestions}
        positions={positions}
        questionId={null}
      />
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
                    className="hover:bg-gray-100 transition-all ease-linear"
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
                    No hay preguntas.
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
