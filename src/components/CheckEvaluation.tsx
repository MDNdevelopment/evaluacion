import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
// Dummy data

interface employeeData {
  name: string;
  position: string;
  department: string;
}

interface CheckEvaluationProps {
  evaluationId: string;
  setIsLoadingTable: null | ((isLoading: boolean) => void);
  employeeData: employeeData;
  period?: undefined | string;
}

export const CheckEvaluation = ({
  evaluationId,
  setIsLoadingTable,
  employeeData,
  period,
}: CheckEvaluationProps) => {
  const [open, setOpen] = useState(false);
  const evaluation = useEvaluationCheckStore((state) => state.evaluation);
  const setEvaluation = useEvaluationCheckStore((state) => state.setEvaluation);
  const [retrievedAnswers, setRetrievedAnswers] = useState<any>(null);
  const [categoriesTotal, setCategoriesTotal] = useState<any>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

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
    const { data, error } = await supabase
      .from("evaluation_sessions")
      .select(
        "*, evaluation_responses(*, questions(text, category: categories(name)))"
      )
      .eq("id", evaluationId)
      .single();
    if (error) {
      console.error(error.message);
      return;
    }
    setRetrievedAnswers(data);

    console.log({ dataaaa: data });

    const categoriesTotals = data.evaluation_responses.reduce(
      (acc: any, response: any) => {
        if (!acc[response.questions.category.name]) {
          acc[response.questions.category.name] = {
            total: 0,
            checked: 0,
            questions: [],
          };
        }

        acc[response.questions.category.name].questions.push({
          text: response.questions.text,
          answer: response.response.toString(),
        });
        acc[response.questions.category.name].total++;
        if (response.response) {
          acc[response.questions.category.name].checked++;
        }
        return acc;
      },
      {}
    );

    console.log({ totals: categoriesTotals });

    Object.keys(categoriesTotals).forEach((category) => {
      const questionValue = 10 / categoriesTotals[category].total;
      const score = questionValue * categoriesTotals[category].checked;
      categoriesTotals[category] = {
        total: categoriesTotals[category].total,
        checked: categoriesTotals[category].checked,
        score: score,
        questions: categoriesTotals[category].questions,
      };
    });

    setCategoriesTotal(categoriesTotals);
    setLoadingData(false);
    console.log(categoriesTotals);
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
          className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg"
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
                  : { scale: 0 }
              }
              animate={
                setIsLoadingTable
                  ? { x: "-105%", y: "-25%", scale: 1 }
                  : { x: "25%", y: "-100%", scale: 1 }
              }
              exit={{
                scale: 0.2,
                x: "-60%",
                y: "-45%",
                opacity: 0,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex flex-col absolute h-full max-h-[700px] bg-white overflow-y-hidden  z-10 evaluation-container max-w-4xl mx-auto p-6  border-2  shadow-lg rounded-lg ${
                setIsLoadingTable ? "w-[40%]" : "w-[30%]"
              }`}
            >
              {/* Evaluation Metadata Header */}
              <div className="evaluation-header bg-gray-100 p-4 pb-2 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Resumen de Evaluación
                </h2>
                <p className="text-gray-600">
                  <strong>Empleado:</strong> {employeeData.name}
                </p>

                <p className="text-gray-600">
                  <strong>Posición:</strong> {employeeData.position}
                </p>
                <p className="text-gray-600">
                  <strong>Departamento:</strong> {employeeData.department}
                </p>
                <p className="text-gray-600">
                  <strong>Periodo de Evaluación:</strong> {period}
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
                {categoriesTotal &&
                  categoriesTotal !== null &&
                  !loadingData &&
                  Object.keys(categoriesTotal).map((category, catIndex) => (
                    <div key={catIndex} className="category-section mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {category}:
                        <span className="text-gray-600 ml-2 font-light">
                          {categoriesTotal[category].score.toFixed(2)} pts - (
                          {categoriesTotal[category].checked}/
                          {categoriesTotal[category].total})
                        </span>
                      </h3>

                      {/* Question Cards for each category */}
                      {categoriesTotal[category].questions.map(
                        (
                          question: { text: string; answer: string },
                          index: number
                        ) => (
                          <div
                            key={question.text}
                            className="question-card mb-4 p-4 border border-gray-300 rounded-lg"
                          >
                            <div className="question">
                              <p className="font-medium text-gray-800">
                                <strong>{`P${index + 1}:`}</strong>{" "}
                                {question.text}
                              </p>
                            </div>
                            <div className="answer mt-2">
                              <p className="text-gray-700">
                                <strong>Respuesta:</strong>{" "}
                                {question.answer === "true" ? "Sí" : "No"}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                {loadingData && (
                  <div className="flex justify-center items-center h-[10rem]">
                    <Spinner />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};
