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
        "*, users!employee_id(*, positions(name), departments(name)), evaluator:users!manager_id(first_name, last_name)"
      )
      .eq(idColumn, idToUse)
      .gte("period", firstDay)
      .lte("period", lastDay);

    if (error) {
      console.log(error.message);
      return;
    }

    console.log(data);
    setUserEvaluations(data);
  };

  useEffect(() => {
    if (user) {
      getEvaluationsMadeByUser();
    }
  }, []);
  return (
    <>
      <h1>Employee evaluations list</h1>
      <div className="grid grid-cols-3 gap-4">
        {userEvaluations && userEvaluations.length > 0 ? (
          userEvaluations.map((evaluation) => {
            console.log({ evaluation });
            return (
              <Card key={`evaluation-${evaluation.id}`} className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    {idColumn === "manager_id" ? (
                      <span className="text-muted-foreground">
                        Evaluación a {evaluation.users.first_name}{" "}
                        {evaluation.users.last_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Evaluación hecha por {evaluation.evaluator.first_name}{" "}
                        {evaluation.evaluator.last_name}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <p>
                      Departamento:{" "}
                      <span className="font-bold">
                        {evaluation.users.departments.name}
                      </span>
                    </p>
                    <p>
                      Posición:{" "}
                      <span className="font-bold">
                        {evaluation.users.positions.name}
                      </span>
                    </p>
                    <p className="text-[1.2em] text-gray-800">
                      Puntaje total:{" "}
                      <span className="font-bold">
                        {evaluation.total_score.toFixed(2)}
                      </span>
                    </p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <CheckEvaluation
                    period={firstDay}
                    setIsLoadingTable={null}
                    evaluationId={evaluation.id}
                    employeeData={{
                      name: `${evaluation.users.first_name} ${evaluation.users.last_name}`,
                      position: evaluation.users.positions.name,
                      department: evaluation.users.departments.name,
                    }}
                  />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p>No evaluations found</p>
        )}
      </div>
    </>
  );
}

{
  /* <CheckEvaluation
            openEvaluationId={openEvaluationId}
            setOpenEvaluationId={setOpenEvaluationId}
            evaluationId={evaluation.id}
            setIsLoadingTable={setIsLoading}
            employeeData={{
              name: `${row.original.first_name} ${row.original.last_name}`,
              position: row.original.positions.name,
              department: Array.isArray(row.original.departments)
                ? row.original.departments[0].name
                : row.original.departments.name,
            }}
          /> */
}
