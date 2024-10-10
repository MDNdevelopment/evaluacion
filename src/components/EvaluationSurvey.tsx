import { FormProvider, useForm } from "react-hook-form";
import SurveyQuestion from "./SurveyQuestion";
import { CATEGORIES } from "../constants/evaluationCategories";
import { supabase } from "../services/supabaseClient";
import { useState } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "../stores/useUserStore";

interface Props {
  evaluationData: Evaluation | "";
  userData: string;
  employeeData: EmployeeData;
  periodStart: string;
  periodEnd: string;
  retrieveEmployees: Function;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface EmployeeData {
  id: string;
  name: string;
  department: number;
}

interface Evaluation {
  evaluation_id: number;
  evaluated_at: string;
  period_start: string;
  period_end: string;
  made_by: string;
  taget_employee: string;
  commitment: number;
  customer_service: number;
  initiative: number;
  process_tracking: number;
  quality: number;
  responsibility: number;
  total_rate: number;
  note: string;
}

export default function EvaluationSurvey({
  evaluationData,
  employeeData,
  userData,
  periodStart,
  periodEnd,
  setOpen,
  retrieveEmployees,
}: Props) {
  const user = useUserStore((state) => state.user);
  const methods = useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mandatoryComment, setMandatoryComment] = useState<boolean>(false);
  const [autoFilledVal, setAutoFilledVal] = useState<number | null>(null);
  const onSubmit = methods.handleSubmit(async (data) => {
    const hasLowScore = CATEGORIES.some((category) => data[category.name] <= 4);

    if (hasLowScore && !data.note) {
      setMandatoryComment(true);
      return;
    }

    setIsLoading(true);
    let total_rate = (
      (data.commitment +
        data.initiative +
        data.responsibility +
        data.customer_service +
        data.process_tracking +
        data.quality) /
      6
    ).toFixed(2);

    const { error } = await supabase.from("evaluations").insert({
      quality: data.quality,
      responsibility: data.responsibility,
      commitment: data.commitment,
      initiative: data.initiative,
      customer_service: data.customer_service,
      process_tracking: data.process_tracking,
      made_by: userData,
      target_employee: employeeData.id,
      total_rate: total_rate,
      period_start: periodStart,
      period_end: periodEnd,
      department_id: employeeData.department,
      note: data.note,
    });

    if (error) {
      setIsLoading(false);
      console.log(error.message);
    }

    toast.success("¡Evaluación cargada con éxito!", {
      position: "bottom-right",
    });
    setOpen(false);
    retrieveEmployees();
    setIsLoading(false);
  });

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          {CATEGORIES.map((category, index) => {
            return (
              <SurveyQuestion
                isLoading={isLoading}
                desc={category.desc}
                question={category.question}
                name={category.name}
                autoFilledVal={autoFilledVal}
                setAutoFilledVal={setAutoFilledVal}
                value={
                  !!evaluationData
                    ? Object.values(evaluationData)[index + 1]
                    : null
                }
              />
            );
          })}
          <div className="flex flex-row px-5 justify-around items-start border-t py-5 border-gray-300 ">
            <div className=" w-1/5">
              <p className="  mr-5 font-black text-gray-900 leading-5">
                Comentario adicional
              </p>
            </div>
            <div className="w-4/5">
              <textarea
                disabled={!!evaluationData ? true : false}
                value={!!evaluationData ? evaluationData.note : undefined}
                {...methods.register("note")}
                className="resize-none border border-gray-300 shadow-sm rounded-md w-full min-h-[3rem] p-2"
              />
              {mandatoryComment && (
                <p className="text-red-500 text-sm">
                  Un comentario de retroalimentación es obligatorio si una de
                  las categorias tiene un valor de 4 o menos.
                </p>
              )}
            </div>
          </div>
          {user && user.privileges > 3 && evaluationData === null && (
            <div className="flex flex-row justify-center items-center">
              {[6, 7, 8, 9].map((val) => (
                <div
                  key={val}
                  onClick={() => {
                    setAutoFilledVal(val);
                  }}
                  className={`mx-2 bg-blue-600 w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-md cursor-pointer transition-all hover:bg-blue-800`}
                >
                  <p className=" font-bold">{val}</p>
                </div>
              ))}
            </div>
          )}
          {evaluationData === null && (
            <>
              <div className="flex flex-row justify-center items-center py-5">
                <button
                  disabled={isLoading}
                  className={`${
                    isLoading
                      ? "bg-gray-300 cursor-progress"
                      : "bg-primary hover:bg-primary-dark"
                  }  text-white font-bold px-3 py-1 rounded-md text-xl `}
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
