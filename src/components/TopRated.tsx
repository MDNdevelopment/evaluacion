import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import Spinner from "./Spinner";
import { Link } from "react-router-dom";

interface Department {
  id: number;
  name: string;
}

interface Evaluation {
  average_commitment: number;
  average_customer_service: number;
  average_initiative: number;
  average_process_tracking: number;
  average_quality: number;
  average_responsibility: number;
  average_total_rate: number;
  department_id: number;
  evaluation_count: number;
  period_end: string;
  period_start: string;
  target_employee: string;
  first_name: string;
  last_name: string;
  role: string;
  privileges: number;
}

export default function TopRated() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const getDepartments = async () => {
    let fetchedDepartments: Department[] = [];
    const { data, error } = await supabase.from("departments").select("*");

    if (error) {
      console.log(error.message);
      return;
    }

    data.map((department) =>
      fetchedDepartments.push({ id: department.id, name: department.name })
    );

    setDepartments(fetchedDepartments);
  };

  const getCurrentPeriodEvaluations = async () => {
    const { data, error } = await supabase
      .from("employee_evaluation_summary_last_month")
      .select(`*`);

    if (error) {
      console.log(error);
      return;
    }

    setEvaluations(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getDepartments();
    getCurrentPeriodEvaluations();
  }, []);

  const calculateEvaluationWeight = (
    averageScore: number,
    evaluationCount: number
  ) => {
    return (averageScore * evaluationCount) / evaluationCount;
  };

  const setBest = (evaluation: Evaluation | null) => {
    return evaluation;
  };

  const getBestEmployee = (department: any) => {
    let finishedSearching = false;
    let best: Evaluation | null = setBest(null);
    let topWeight = 0;
    evaluations.map((evaluation: Evaluation) => {
      if (
        evaluation.department_id === department.id &&
        evaluation.privileges < 4
      ) {
        const currentResult = calculateEvaluationWeight(
          evaluation.average_total_rate,
          evaluation.evaluation_count
        );

        if (currentResult > topWeight) {
          topWeight = currentResult;
          best = setBest(evaluation);
        }
      }
    });
    finishedSearching = true;

    if (best === null && finishedSearching) {
      return (
        <div className="flex justify-center  flex-1 items-center pt-5 flex-col">
          <h2 className="text-gray-400 font-bold text-3xl text-center">
            Aún no hay evaluaciones...
          </h2>
        </div>
      );
    }

    return (
      <div className="flex-1 ">
        {best === null ? (
          <div className="flex justify-center items-center pt-14">
            <Spinner />
          </div>
        ) : (
          <div className="flex justify-center items-center pt-5 flex-col">
            <h2 className="text-6xl font-black text-[#222]">
              {best.average_total_rate}
            </h2>
            <h3 className="text-xl">
              {best.first_name} {best.last_name}
            </h3>
            <h4 className="text-gray-500">{best.role}</h4>
            <h4>
              Evaluaciones:{" "}
              <span className="font-black text-xl text-primary-dark">
                {best.evaluation_count}
              </span>
            </h4>

            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-1 px-2 rounded-md mt-2">
              <Link to={`/empleado/${best.target_employee}`}>Ir al perfil</Link>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="mt-5">
      <h2 className="text-gray-800 font-black text-2xl">Mejores promedios</h2>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {departments &&
          departments.map((department) => {
            if (
              department.id === 0 ||
              department.id === 5 ||
              department.id === 6
            )
              return;
            return (
              <div className="shadow-md flex flex-col items-center justify-between rounded-md flex-1 bg-white min-h-[17rem]">
                <h3 className="   text-center pt-3 uppercase font-semibold text-primary-dark">
                  {department.name}
                </h3>

                {getBestEmployee(department)}
              </div>
            );
          })}
      </div>
    </div>
  );
}
