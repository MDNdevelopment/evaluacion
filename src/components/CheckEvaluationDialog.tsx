import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { getMonthName } from "@/utils/getMonthName";
import { supabase } from "@/services/supabaseClient";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";
import { Link } from "react-router-dom";
import { XIcon } from "lucide-react";
import Spinner from "./Spinner";
import { formatScore } from "@/utils/scoreUtils";
import { getScoreColor } from "@/utils/getScoreColor";

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

export const CheckEvaluationDialog = ({
  evaluationId,
  employeeData,
}: CheckEvaluationProps) => {
  const [open, setOpen] = useState(false);
  const evaluation = useEvaluationCheckStore((state) => state.evaluation);
  const [retrievedAnswers, setRetrievedAnswers] = useState<any>(null);
  const [_loadingData, setLoadingData] = useState<boolean>(true);
  const [evaluationPeriod, setEvaluationPeriod] = useState<string | null>(null);

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
    if (open) {
      getEvaluationData();
    }
  }, [evaluation, open]);

  if (evaluationId)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={() => {}} asChild>
          <Button variant="outline" className="">
            Ver evaluación
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] [&>button]:hidden max-h-[70vh] overflow-y-hidden  flex flex-col">
          <DialogHeader>
            <div className="evaluation-header bg-gray-100 p-4 pb-2 rounded-lg mb-6 relative">
              <DialogClose asChild={true}>
                <XIcon
                  className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                  }}
                />
              </DialogClose>
              <DialogTitle className="mb-2">Resumen de evaluación</DialogTitle>

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
            </div>
          </DialogHeader>

          <div className="categories-section h-full  overflow-y-auto ">
            {retrievedAnswers ? (
              <>
                {retrievedAnswers.evaluation_responses.map((response: any) => {
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
                })}

                {retrievedAnswers.evaluation_comments[0]?.comment !== "" && (
                  <div className="bg-gray-100 min-h-[6.5rem] p-4">
                    <h3 className="font-bold">Comentarios adicionales:</h3>
                    <p className="mt-1 rounded-r-lg text-left w-full">
                      {retrievedAnswers.evaluation_comments[0].comment}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center w-full h-24">
                <Spinner />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
};
