import { FormProvider, useForm } from "react-hook-form";
import SurveyQuestion from "./SurveyQuestion";
import { CATEGORIES } from "../constants/evaluationCategories";
import { supabase } from "../services/supabaseClient";
import { useState } from "react";

interface Props {
  evaluationData: Evaluation | {};
  userData: string;
  employeeData: EmployeeData;
  periodStart: Date;
  periodEnd: Date;
}

interface EmployeeData {
  id: string;
  name: string;
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
}

interface Inputs {}

export default function EvaluationSurvey({
  evaluationData,
  employeeData,
  userData,
  periodStart,
  periodEnd,
}: Props) {
  const methods = useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onSubmit = async (data) => {
    setIsLoading(true);
    console.log(data);
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
    });

    if (error) {
      setIsLoading(false);
      console.log(error.message);
    }

    console.log("data uploaded successfully");
    // setIsLoading(false);
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {CATEGORIES.map((category) => {
            return (
              <SurveyQuestion
                isLoading={isLoading}
                question={category.question}
                name={category.name}
                value={!!evaluationData ? evaluationData[category.name] : null}
              />
            );
          })}
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