import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/services/supabaseClient";
import getPastMonthRange from "@/utils/getPastMonthRange";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { getCategoryName } from "../utils/getCategoryName";

export const EvaluationsMadeBy = ({ employeeData }: any) => {
  const { firstDay, lastDay } = getPastMonthRange();
  const [evaluations, setEvaluations] = useState<any>([]);
  const [evaluationKeys, setEvaluationKeys] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  //Get the evaluations made by this employee for the current period from supabase
  useEffect(() => {
    if (employeeData && employeeData.user_id) {
      getEvaluationsByEmployee();
    }
  }, [employeeData]);

  const getEvaluationsByEmployee = async () => {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*, users!target_employee (first_name, last_name)")
      .eq("made_by", employeeData.user_id)
      .gte("period_start", firstDay)
      .lte("period_end", lastDay);

    if (error) {
      console.log("there was an error", error);

      return <p>There was an error</p>;
    }

    if (data) {
      //Sort the evaluations by the employee first name from A to Z
      data.sort((a: any, b: any) =>
        a.users.first_name > b.users.first_name ? 1 : -1
      );

      setLoading(false);

      setEvaluations(data);
      //Get the evaluation keys removing all the non necessary keys like evaluation_id, made_by, target_employee, period_start, period_end
      const keys = Object.keys(data[0]).filter(
        (key) =>
          key !== "evaluation_id" &&
          key !== "made_by" &&
          key !== "target_employee" &&
          key !== "period_start" &&
          key !== "period_end" &&
          key !== "evaluated_at" &&
          key !== "users" &&
          key !== "department_id"
      );
      setEvaluationKeys(keys);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluaciones hechas</CardTitle>
        <CardDescription className="pb-1">
          Evaluaciones hechas por{" "}
          <span className="font-bold text-darkText">
            {employeeData.first_name} {employeeData.last_name}
          </span>{" "}
          para el período actual{": "}
          <span className="font-bold text-darkText">{evaluations.length}</span>
        </CardDescription>
        {!loading ? (
          <CardContent className="grid p-0 lg:p-6 lg:grid-cols-3 lg:gap-x-3 gap-y-3 flex-wrap">
            {evaluations && evaluations.length > 0
              ? evaluations.map((evaluation: any) => (
                  <Card
                    key={`evaluation-${evaluation.evaluation_id}`}
                    className="shadow-sm"
                  >
                    <CardHeader>
                      <CardTitle>
                        <span className="text-muted-foreground">
                          Evaluación a
                        </span>{" "}
                        {evaluation.users.first_name}{" "}
                        {evaluation.users.last_name}
                      </CardTitle>
                      <CardDescription>
                        {evaluation.period_start} a {evaluation.period_end}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="">
                      {evaluationKeys.map((key: any, index: number) => (
                        <div
                          key={`cat-${index}`}
                          className={`flex justify-between py-[.2rem] ${
                            index < evaluationKeys.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          } hover:bg-gray-100 px-2 rounded-sm`}
                        >
                          <span className="font-regular text-xs">
                            {`${getCategoryName(key)}: `}
                          </span>

                          <span className="font-medium text-sm pl-2">
                            {evaluation[key] ? evaluation[key] : "N/A"}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              : null}
          </CardContent>
        ) : (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </CardHeader>
    </Card>
  );
};
