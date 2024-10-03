import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import getPastMonthRange from "../utils/getPastMonthRange";
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
}

export default function TopRated() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  let { firstDay, lastDay } = getPastMonthRange();

  const getDepartmentById = (id: number) => {
    return departments.map((department) =>
      department.id == id ? department.name : null
    );
  };

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

    console.log(data);
  };

  const determineBestByDepartment = (groupedByDepartment) => {
    let accEvaluations = [];
  };

  const getCurrentPeriodEvaluations = async () => {
    const { data, error } = await supabase
      .from("employee_evaluation_summary_last_month")
      .select(`*`);

    if (error) {
      console.log(error);
    }

    console.log({ data });
    setEvaluations(data);
    setIsLoading(false);
  };
  //Filter the data by department

  // async function calculateBestEmployeeByDepartment() {
  //   // Group evaluations by department_id
  //   const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
  //     // Initialize the department if not present
  //     if (!acc[evaluation.department_id]) {
  //       acc[evaluation.department_id] = {}; // Initialize the department group
  //     }

  //     // Initialize the employee if not present in the department
  //     if (!acc[evaluation.department_id][evaluation.target_employee]) {
  //       acc[evaluation.department_id][evaluation.target_employee] = {
  //         totalEvaluations: 0,
  //         totalQuality: 0,
  //         totalResponsibility: 0,
  //         totalCommitment: 0,
  //         totalInitiative: 0,
  //         totalCustomerService: 0,
  //         totalProcessTracking: 0,
  //       } as EmployeeEvaluationSummary;
  //     }

  //     // Get the employee object
  //     const employeeEval =
  //       acc[evaluation.department_id][evaluation.target_employee];

  //     // Check if the employeeEval object exists before modifying it
  //     if (!employeeEval) {
  //       console.error(
  //         `Employee evaluation object not initialized for department ${evaluation.department_id}`
  //       );
  //       return acc;
  //     }

  //     // Increment total evaluations
  //     employeeEval.totalEvaluations++;

  //     // Sum the individual fields
  //     employeeEval.totalQuality += evaluation.quality;
  //     employeeEval.totalResponsibility += evaluation.responsibility;
  //     employeeEval.totalCommitment += evaluation.commitment;
  //     employeeEval.totalInitiative += evaluation.initiative;
  //     employeeEval.totalCustomerService += evaluation.customer_service;
  //     employeeEval.totalProcessTracking += evaluation.process_tracking;

  //     return acc;
  //   }, {} as Record<number, Record<string, EmployeeEvaluationSummary>>);

  //   console.log({ groupedEvaluations });
  // }

  useEffect(() => {
    getDepartments();
    getCurrentPeriodEvaluations();
  }, []);

  const calculateEvaluationWeight = (averageScore, evaluationCount) => {
    return (averageScore * evaluationCount) / (evaluationCount + 5);
  };

  const getBestEmployee = (department: any) => {
    let best: Evaluation | null = null;
    let topWeight = 0;
    evaluations.map((evaluation) => {
      if (evaluation.department_id === department.id) {
        const currentResult = calculateEvaluationWeight(
          evaluation.average_total_rate,
          evaluation.evaluation_count
        );

        if (currentResult > topWeight) {
          console.log({ here: evaluation });
          topWeight = currentResult;
          best = evaluation;
          console.log({ best });
        }
      } else {
        console.log("no coincideee");
      }
      return <></>;
    });

    return (
      <div className="flex-1 ">
        {!best ? (
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
            console.log(department);
            if (
              department.id === 0 ||
              department.id === 4 ||
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