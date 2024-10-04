import { FormProvider, useForm } from "react-hook-form";
import SurveyQuestion from "./SurveyQuestion";
import { CATEGORIES } from "../constants/evaluationCategories";
import { supabase } from "../services/supabaseClient";
import { useState } from "react";
import { toast } from "react-toastify";

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
  const methods = useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onSubmit = methods.handleSubmit(async (data) => {
    setIsLoading(true);
    console.log({ daaaataaa: data });
    let total_rate = (
      (data.commitment +
        data.initiative +
        data.responsibility +
        data.customer_service +
        data.process_tracking +
        data.quality) /
      6
    ).toFixed(2);
    console.log(employeeData);
    console.log(userData);

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

    console.log("data uploaded successfully");
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
            console.log({ category });
            return (
              <SurveyQuestion
                isLoading={isLoading}
                question={category.question}
                name={category.name}
                value={
                  !!evaluationData
                    ? Object.values(evaluationData)[index + 1]
                    : null
                }
              />
            );
          })}
          <div className="flex flex-row justify-around items-center border-t py-5 border-gray-300">
            <div className=" w-1/5">
              <label htmlFor="" className="  mr-5 font-black text-gray-900">
                Comentario adicional:
              </label>
            </div>
            <div className="w-4/5">
              <textarea
                disabled={!!evaluationData ? true : false}
                value={!!evaluationData ? evaluationData.note : ""}
                {...methods.register("note")}
                className="resize-none border border-gray-300 shadow-sm rounded-md w-full min-h-[3rem] p-2"
              />
            </div>
          </div>
          {evaluationData === null && (
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
          )}
        </form>
      </FormProvider>
    </div>
  );
}
