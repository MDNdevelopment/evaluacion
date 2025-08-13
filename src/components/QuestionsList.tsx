import { useEffect, useState } from "react";

import { supabase } from "@/services/supabaseClient";
import { Company, Position, Question } from "@/types";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ListPlus, Trash } from "lucide-react";
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
import { ConfirmationDialog } from "./ConfirmationDialog";
import { QuestionsFilter } from "./QuestionsFilter";
import { DialogDescription, DialogTitle } from "./ui/dialog";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validQuestions, setValidQuestions] = useState<Question[]>([]);

  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const filterQuestions = (positions: any) => {
    console.log("filtering questions");
    const filteredQuestions = questions.reduce((acc: any, curr: any) => {
      curr.positions.map((position: any) => {
        if (positions.includes(position.position_id)) {
          if (!acc.includes(curr)) {
            acc.push(curr);
          }
        }
      });
      return acc;
    }, []);

    if (filteredQuestions.length === 0) {
      setValidQuestions(questions);
      return;
    }

    setValidQuestions(filteredQuestions);
  };

  const fetchQuestions = async () => {
    console.log("fetching questions");
    const { data, error } = await supabase
      .from("questions")
      .select(
        "*, positions:question_positions(...positions(position_id, position_name)),tags:question_tags(id, tag)"
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
      setValidQuestions(sortedQuestions);
      return;
    }
    setQuestions([]);
  };

  const handlePositionClick = (positionId: number) => {
    let newPositions = [];
    if (selectedPositions.includes(positionId)) {
      newPositions = selectedPositions.filter((id) => id !== positionId);
    } else {
      newPositions = [...selectedPositions, positionId];
    }

    setSelectedPositions(newPositions);

    filterQuestions(newPositions);
  };

  useEffect(() => {
    if (fetchingQuestions) {
      fetchQuestions();
      setFetchingQuestions(false);
    }
  }, [company, fetchingQuestions]);

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
        <div className=" pl-3 w-full flex flex-col items-start justify-center ">
          <div className="flex flex-row flex-start gap-x-3 items-center ">
            {row.original.removed && (
              <div className="bg-red-700 text-white px-1 py-1 text-xs rounded-sm font-bold">
                Desactivada
              </div>
            )}
            {row.original.text}
          </div>

          {(row.original.tags ?? []).length > 0 && (
            <div className="mt-4">
              <div className="flex flex-row fles-wrap">
                {(row.original.tags ?? []).map((tag) => {
                  return <Tag key={tag.id} text={tag.tag} />;
                })}
              </div>
            </div>
          )}
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

            <ConfirmationDialog
              confirmText={row.original.removed ? "Agregar" : "Eliminar"}
              mode={row.original.removed ? "add" : "delete"}
              handleSubmit={() => {
                //TODO: Que no se vaya a la pagina 0 al hacer fetch de preguntas

                if (row.original.removed) {
                  handleAddQuestion(row.original.id, () => {
                    setFetchingQuestions(true);
                    filterQuestions(selectedPositions);
                  });
                  row.original.removed = false;
                } else {
                  handleDeleteQuestion(row.original.id, () => {
                    setFetchingQuestions(true);
                    filterQuestions(selectedPositions);
                  });
                }
              }}
              triggerText={row.original.removed ? <ListPlus /> : <Trash />}
            >
              <DialogTitle className="mt-1">
                {row.original.removed
                  ? "Agergar pregunta"
                  : "Eliminar pregunta"}
              </DialogTitle>
              <DialogDescription>
                {row.original.removed
                  ? "La pregunta se encuentra desactivada. ¿Deseas activarla de nuevo?"
                  : "Si la pregunta ha sido respondida en alguna evaluación, será desactivada, de lo contrario será eliminada."}
              </DialogDescription>
            </ConfirmationDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: validQuestions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const question = row.original.text.toLowerCase();
      const searchValue = filterValue.toLowerCase();

      return question.includes(searchValue);
    },
  });

  return (
    <div className="flex flex-col">
      {JSON.stringify(table.getState().pagination)}
      {JSON.stringify(table.getCanNextPage())}
      <QuestionDialog
        company={company}
        setFetchingQuestions={setFetchingQuestions}
        positions={positions}
        questionId={null}
      />
      <QuestionsFilter
        departments={positions}
        handlePositionClick={handlePositionClick}
        selectedPositions={selectedPositions}
      />
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-row justify-between items-end py-4 ">
          <Input
            placeholder="Buscar..."
            onChange={(event) => {
              if (event.target.value === "") {
                return table.setGlobalFilter(event.target.value);
              }

              return table.setGlobalFilter(event.target.value);
            }}
            className="max-w-sm border border-gray-300 rounded-md px-2 py-1"
          />
          <div className=" text-center flex flex-col ">
            {validQuestions.length > 0 && (
              <div className="flex  flex-col gap-4 lg:gap-0 items-center justify-between space-x-2 py-4 px-5">
                <div className="flex items-center justify-between mt-4 mb-2 gap-2">
                  <span className="text-sm text-neutral-600">
                    Página {pagination.pageIndex + 1} de{" "}
                    {Math.ceil(validQuestions.length / pagination.pageSize)}
                    {"."}
                  </span>
                  <span className="text-sm text-neutral-600">
                    Preguntas: {validQuestions.length}
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
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <div
      className={`${
        text === "desactivada"
          ? "bg-red-300 text-red-900"
          : "bg-gray-300 text-gray-800"
      } text-center flex items-center justify-center text-[.75em] w-fit px-3 py-[0.1rem] rounded-sm mx-1`}
    >
      {text}
    </div>
  );
}
async function handleAddQuestion(questionId: number, callback: () => void) {
  const { error } = await supabase
    .from("questions")
    .update({ removed: false })
    .eq("id", questionId);

  if (error) {
    console.log(error.message);
    toast.error("Error al agregar la pregunta", {
      position: "bottom-right",
      autoClose: 1000,
    });
    return;
  }

  toast.success("Pregunta agregada con éxito", {
    position: "bottom-right",
    autoClose: 1000,
  });

  callback();
}
async function handleDeleteQuestion(questionId: number, callback: () => void) {
  //Check if the question has been used in any evaluation
  const { data, error: errorFetchQuestion } = await supabase
    .from("evaluation_responses")
    .select("*")
    .eq("question_id", questionId);
  if (errorFetchQuestion) {
    console.log(errorFetchQuestion.message);
    toast.error("Error al elminar la pregunta EL01", {
      position: "bottom-right",
      autoClose: 1000,
    });
    return;
  }

  //If the question has been used in any evaluation, mark it as removed
  if (data && data.length > 0) {
    const response = await supabase
      .from("questions")
      .update({ removed: true })
      .eq("id", questionId);
    if (response.error) {
      console.log(response.error.message);
      toast.error("Error al elminar la pregunta EL02", {
        position: "bottom-right",
        autoClose: 1000,
      });
      return;
    }

    toast.success("Pregunta desactivada correctamente", {
      position: "bottom-right",
      autoClose: 1000,
    });
  } else {
    // delete question from the database
    const response = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);
    if (response.error) {
      console.log(response.error.message);
      toast.error("Error al eliminar la pregunta EL03", {
        position: "bottom-right",
        autoClose: 1000,
      });
      return;
    }

    toast.success("Pregunta eliminada correctamente", {
      position: "bottom-right",
      autoClose: 1000,
    });
  }

  callback();

  return;
}
