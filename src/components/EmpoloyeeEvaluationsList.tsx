import { supabase } from "@/services/supabaseClient";
import { useUserStore } from "@/stores";
import getPastMonthRange from "@/utils/getPastMonthRange";
import { useEffect, useState } from "react";
import { CheckEvaluation } from "./CheckEvaluation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface EmployeeEvaluationsListProps {
  employeeId?: string | undefined;
  evaluatorId?: string | undefined;
}
export default function EmployeeEvaluationsList({
  employeeId,
  evaluatorId,
}: EmployeeEvaluationsListProps) {
  const user = useUserStore((state) => state.user);
  const [userEvaluations, setUserEvaluations] = useState<any[] | null>(null);
  const { firstDay, lastDay } = getPastMonthRange();
  const idToUse = employeeId || evaluatorId;
  const idColumn = employeeId ? "employee_id" : "manager_id";

  const getEvaluationsMadeByUser = async () => {
    const { data, error } = await supabase
      .from("evaluation_sessions")
      .select(
        "*, users!employee_id(*, positions(position_name), departments(department_name)), evaluator:users!manager_id(first_name, last_name, positions(position_name), departments(department_name))"
      )
      .eq(idColumn, idToUse)
      .gte("period", firstDay)
      .lte("period", lastDay);

    if (error) {
      console.log(error.message);
      return;
    }

    setUserEvaluations(data);
  };

  useEffect(() => {
    if (user) {
      getEvaluationsMadeByUser();
    }
  }, [evaluatorId, employeeId]);
  return (
    <>
      <div
        className={`grid gap-4 ${
          userEvaluations && userEvaluations.length > 0
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : ""
        }`}
      >
        {userEvaluations && userEvaluations.length > 0 ? (
          userEvaluations.map((evaluation) => {
            const evaluatorName = `${evaluation.evaluator.first_name} ${evaluation.evaluator.last_name}`;
            const evaluatorDepartment =
              evaluation.evaluator.departments.department_name;
            const evaluatorPosition =
              evaluation.evaluator.positions.position_name;
            const employeeName = `${evaluation.users.first_name} ${evaluation.users.last_name}`;
            const employeeDepartment =
              evaluation.users.departments.department_name;
            const employeePosition = evaluation.users.positions.position_name;

            return (
              <Card key={`evaluation-${evaluation.id}`} className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    <span className="text-darkText-lighter">
                      Evaluación{" "}
                      {user && user.access_level > 1
                        ? idColumn === "manager_id"
                          ? "a "
                          : "de "
                        : "recibida"}
                      <span className="text-darkText font-bold">
                        {user && user.access_level > 1
                          ? idColumn === "manager_id"
                            ? employeeName
                            : evaluatorName
                          : null}
                      </span>
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <p>
                      Departamento:{" "}
                      <span className="font-bold text-darkText">
                        {idColumn === "manager_id"
                          ? employeeDepartment
                          : evaluatorDepartment}
                      </span>
                    </p>
                    {user && user.access_level > 1 && (
                      <p>
                        Posición:{" "}
                        <span className="font-bold text-darkText">
                          {idColumn === "manager_id"
                            ? employeePosition
                            : evaluatorPosition}
                        </span>
                      </p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <p className="text-3xl text-darkText  font-black">
                    {evaluation.total_score.toFixed(2)}
                  </p>
                  <CheckEvaluation
                    setIsLoadingTable={null}
                    evaluationId={evaluation.id}
                    employeeData={{
                      id: evaluation.users.user_id,
                      name: `${evaluation.users.first_name} ${evaluation.users.last_name}`,
                      position: evaluation.users.positions.position_name,
                      department: evaluation.users.departments.department_name,
                    }}
                  />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-md shadow-sm bg-white flex justify-center items-center w-full h-24">
            <p className="text-gray-500">No se encontraron evaluaciones</p>
          </div>
        )}
      </div>
    </>
  );
}
