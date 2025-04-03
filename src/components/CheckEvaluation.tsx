import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { getMonthName } from "@/utils/getMonthName";
import { formatScore } from "@/utils/scoreUtils";
import { getScoreColor } from "../utils/getScoreColor";
import { Link } from "react-router-dom";

interface employeeData {
  id: string;
  name: string;
  position: string;
  department: string;
}

interface CheckEvaluationProps {
  evaluationId: string;
  setIsLoadingTable: null | ((isLoading: boolean) => void);
  employeeData: employeeData;
}

export const CheckEvaluation = ({
  evaluationId,
  setIsLoadingTable,
  employeeData,
}: CheckEvaluationProps) => {
  const [open, setOpen] = useState(false);
  const evaluation = useEvaluationCheckStore((state) => state.evaluation);
  const setEvaluation = useEvaluationCheckStore((state) => state.setEvaluation);
  const [retrievedAnswers, setRetrievedAnswers] = useState<any>(null);
  const [_loadingData, setLoadingData] = useState<boolean>(true);
  const [evaluationPeriod, setEvaluationPeriod] = useState<string | null>(null);
  const handleClick = () => {
    if (!open) {
      if (evaluation?.id !== evaluationId) {
        setEvaluation({ id: evaluationId });
      }
    } else {
      setEvaluation(null);
    }
  };

  const handleDeleteEvaluation = async () => {
    const response = await supabase
      .from("evaluation_sessions")
      .delete()
      .eq("id", evaluationId);

    if (response?.error) {
      console.error(response.error);
      return;
    }

    toast.success("Evaluación eliminada correctamente", {
      position: "bottom-right",
      autoClose: 1500,
    });

    if (setIsLoadingTable) {
      setIsLoadingTable(true);
    }
  };

  const getEvaluationData = async () => {
    const { data: evaluations, error } = await supabase
      .from("evaluation_sessions")
      .select(
        "*, evaluation_responses(response, question:questions(text)), evaluation_comments(comment)"
      )
      .eq("id", evaluationId)
      .single();
    if (error) {
      console.error(error.message);
      return;
    }

    console.log({ evaluations });
    setRetrievedAnswers(evaluations);

    const period = `${getMonthName(evaluations.period.split("-")[1])}-${
      evaluations.period.split("-")[0]
    }`;
    setEvaluationPeriod(period);

    setLoadingData(false);
  };

  useEffect(() => {
    if (evaluation?.id === evaluationId) {
      setOpen(true);
      getEvaluationData();
    } else {
      setOpen(false);
    }
  }, [evaluation]);

  if (evaluationId)
    return (
      <div>
        <button
          className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm"
          onClick={handleClick}
        >
          Ver evaluación
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key={evaluationId}
              initial={
                setIsLoadingTable
                  ? { x: "-60%", y: "-55%", scale: 0 }
                  : { x: "-30%", y: "-55%", scale: 0 }
              }
              animate={
                setIsLoadingTable
                  ? { x: "-105%", y: "-25%", scale: 1 }
                  : { x: "0%", y: "-110%", scale: 1 }
              }
              exit={
                setIsLoadingTable
                  ? {
                      scale: 0.2,
                      x: "-60%",
                      y: "-45%",
                      opacity: 0,
                    }
                  : {
                      scale: 0.2,
                      x: "-10%",
                      y: "-65%",
                      opacity: 0,
                    }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex flex-col absolute  max-h-[700px] bg-white overflow-y-hidden  z-10 evaluation-container max-w-4xl mx-auto p-6  border-2  shadow-lg rounded-lg ${
                setIsLoadingTable ? "w-[40%] h-full" : "w-[32rem] h-[80%]"
              }`}
            >
              {/* Evaluation Metadata Header */}
              <div className="evaluation-header bg-gray-100 p-4 pb-2 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Resumen de Evaluación
                </h2>
                <Link
                  to={`/empleado/${employeeData.id}`}
                  className="text-gray-600"
                >
                  <strong>Empleado:</strong> {employeeData.name}
                </Link>

                <p className="text-gray-600">
                  <strong>Cargo:</strong> {employeeData.position}
                </p>
                <p className="text-gray-600">
                  <strong>Departamento:</strong> {employeeData.department}
                </p>
                <p className="text-gray-600">
                  <strong>Periodo de Evaluación:</strong> {evaluationPeriod}
                </p>
                <p className="text-gray-600 text-base">
                  <strong>Puntaje:</strong>{" "}
                  {retrievedAnswers?.total_score.toFixed(2)}
                </p>
                <div className="w-full flex justify-end">
                  {setIsLoadingTable ? (
                    <button
                      className="hover:underline"
                      onClick={() => handleDeleteEvaluation()}
                    >
                      Eliminar evaluación
                    </button>
                  ) : (
                    <button
                      className="hover:underline"
                      onClick={() => setEvaluation(null)}
                    >
                      Cerrar evaluación
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Section */}
              <div className="categories-section h-[100%]  overflow-y-scroll">
                {retrievedAnswers ? (
                  <>
                    {retrievedAnswers.evaluation_responses.map(
                      (response: any) => {
                        return (
                          <div
                            key={`response-${response.question.text}`}
                            className="bg-gray-100 p-0 min-h-[6.5rem] flex flex-row justify-between items-stretch mb-4 rounded-lg shadow-md"
                          >
                            <span className="w-4/5 p-4">
                              {response.question.text}
                            </span>{" "}
                            <div
                              className={`${getScoreColor(
                                response.response
                              )} p-4 flex flex-col justify-center items-center font-black text-2xl text-white rounded-r-lg w-1/5`}
                            >
                              {" "}
                              {response.response}
                              <span className="text-xs text-center">
                                {formatScore(response.response)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}

                    {retrievedAnswers.evaluation_comments[0]?.comment !==
                      "" && (
                      <div className="bg-gray-100 min-h-[6.5rem] p-4">
                        <h3 className="font-bold">Comentarios adicionales:</h3>
                        <p className="mt-1 rounded-r-lg text-left w-full">
                          {retrievedAnswers.evaluation_comments[0].comment}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};
