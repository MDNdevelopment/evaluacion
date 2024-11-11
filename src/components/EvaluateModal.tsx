import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FaClipboardCheck, FaTrashAlt } from "react-icons/fa";
import getPastMonthRange from "../utils/getPastMonthRange";
import formatDateForDisplay from "../utils/formatDateForDisplay";
import Spinner from "./Spinner";
import { supabase } from "../services/supabaseClient";
import EvaluationSurvey from "./EvaluationSurvey";
import { toast } from "react-toastify";

interface Props {
  userData: string;
  employeeData: Employee;
  retrieveEmployees: Function;
}

interface Employee {
  id: string;
  name: string;
  department: number;
}

export default function EvaluateModal({
  userData,
  employeeData,
  retrieveEmployees,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [checkingEvaluation, setCheckingEvaluation] = useState<boolean>(true);
  const [evaluationData, setEvaluationData] = useState<any>(null);

  let { firstDay, lastDay } = getPastMonthRange();

  const checkEvaluation = async () => {
    const { data, error } = await supabase
      .from("evaluations")
      .select(`*`)
      .eq("made_by", userData)
      .eq("target_employee", employeeData.id)
      .gte("period_start", firstDay)
      .lte("period_end", lastDay)
      .single();

    if (error) {
      console.log("there was an error", error);
      setEvaluationData(null);
      setCheckingEvaluation(false);
    } else if (data) {
      setCheckingEvaluation(false);
      setEvaluationData(data);
    } else {
      setCheckingEvaluation(false);
    }

    setCheckingEvaluation(false);
  };

  const handleDelete = async () => {
    if (evaluationData) {
      const { error } = await supabase
        .from("evaluations")
        .delete()
        .eq("evaluation_id", evaluationData.evaluation_id);

      if (error) {
        console.log(error);
        toast.error("No se pudo eliminar la evaluación", {
          position: "bottom-right",
        });
      } else {
        setOpen(false);
        setDeleteOpen(false);
        retrieveEmployees();
        toast.success("Evaluación eliminada con éxito", {
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <>
      <FaClipboardCheck
        size={22}
        color={"#222222"}
        className="mx-2 cursor-pointer"
        onClick={() => {
          setOpen(true);
          checkEvaluation();
        }}
      />
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-red-600 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-modal-evaluation data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left  w-full">
                    <div className="flex justify-between items-center pr-5">
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          {`Evaluación a ${employeeData.name}`}
                        </DialogTitle>
                        <p className="text-sm text-gray-500">
                          Período {formatDateForDisplay(firstDay)} -{" "}
                          {formatDateForDisplay(lastDay)}
                        </p>
                      </div>
                      {evaluationData && (
                        <div>
                          <button
                            onClick={() => {
                              setDeleteOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center px-1 py-2 rounded-md"
                          >
                            <FaTrashAlt
                              size={17}
                              color={"#ffffff"}
                              className="mx-2 cursor-pointer "
                            />
                          </button>
                        </div>
                      )}

                      <div>
                        <p className="text-primary font-black text-2xl">
                          {evaluationData?.total_rate && (
                            <p>PROMEDIO TOTAL: {evaluationData.total_rate}</p>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 dialog-body flex justify-center items-center w-full ">
                      {checkingEvaluation ? (
                        <Spinner />
                      ) : (
                        <EvaluationSurvey
                          periodStart={firstDay}
                          periodEnd={lastDay}
                          evaluationData={evaluationData}
                          employeeData={employeeData}
                          userData={userData}
                          setOpen={setOpen}
                          retrieveEmployees={retrieveEmployees}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={setDeleteOpen}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-red-600 text-center shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-modal-delete-evaluation data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 flex flex-col items-center ">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left  w-full">
                    <div className="flex justify-between items-center pr-5">
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          ¿Seguro que deseas eliminar la evaluación?
                        </DialogTitle>
                        <div className="flex justify-between w-3/6 mx-auto mt-5">
                          <button
                            onClick={() => {
                              setDeleteOpen(false);
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white rounded-md py-1 px-2"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              handleDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-md py-1 px-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
