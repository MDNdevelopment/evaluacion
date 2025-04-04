import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import Spinner from "./Spinner";
import { Link } from "react-router-dom";
import getPastMonthRange from "@/utils/getPastMonthRange";

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
  position: string;
  access_level: number;
}

export default function TopRated() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [averages, setAverages] = useState<any>(null);

  const getDepartments = async () => {
    let fetchedDepartments: Department[] = [];
    const { data, error } = await supabase.from("departments").select("*");

    if (error) {
      console.log(error.message);
      return;
    }

    data.map((department) =>
      fetchedDepartments.push({
        id: department.department_id,
        name: department.department_name,
      })
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

  const getEvaluations = async () => {
    const { firstDay } = getPastMonthRange();
    const { data, error } = await supabase
      .from("evaluation_sessions")
      .select(
        "total_score:total_score.avg(), evaluations_count:total_score.count(), ...users!evaluation_sessions_employee_id_fkey(*, ...departments(department_name))"
      )
      .eq("period", firstDay);

    if (error) {
      console.log(error);
      return;
    }

    console.log(data);
    const avgPerDepartment = data.reduce((acc: any, curr: any) => {
      const departmentName = curr.department_name;

      //Ensure departmentName is defined and valid
      if (!departmentName) {
        console.error("Invalid department name: ", curr);
        return acc;
      }

      if (!acc[departmentName]) {
        acc[departmentName] = {
          totalScore: 0,
          employeeName: "",
          departmentName: departmentName,
          employeeId: "",
          position: "",
          accessLevel: 0,
          evaluationsCount: 0,
        };
      }

      //TODO: A PARTIR DE QUE NIVEL NO DEBEN SALIR AQUI ALGUNOS EMPLEADOS?
      if (
        curr.total_score > acc[departmentName].totalScore &&
        curr.access_level < 3
      ) {
        console.log(`${curr.first_name} is here`);
        acc[departmentName].totalScore = curr.total_score;
        acc[
          departmentName
        ].employeeName = `${curr.first_name} ${curr.last_name}`;
        acc[departmentName].employeeId = curr.user_id;
        acc[departmentName].position = curr.position;
        acc[departmentName].accessLevel = curr.access_level;
        acc[departmentName].departmentName = curr.department_name;
        acc[departmentName].evaluationsCount = curr.evaluations_count;
      }

      return acc;
    }, {});

    setAverages(avgPerDepartment);
  };

  useEffect(() => {
    getDepartments();
    getCurrentPeriodEvaluations();
    getEvaluations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="mt-5">
      <h2 className="text-gray-800 font-black text-2xl">
        Mejores promedios del período actual
      </h2>
      <div className="lg:grid lg:grid-cols-3 lg:gap-4 mt-2 flex flex-col mx-auto">
        {departments &&
          departments.map((department) => {
            console.log({ department });
            if (department.id === 5 || department.id === 6) return;
            return (
              <div
                key={department.name}
                className="my-2 lg:my-0 shadow-md flex flex-col items-center justify-between rounded-md flex-1 bg-white min-h-[17rem]"
              >
                <h3 className="   text-center pt-3 uppercase font-semibold text-primary-dark">
                  {department.name}
                </h3>

                {averages && averages[department.name]?.totalScore > 0 ? (
                  <div className="flex-1 ">
                    <div className="flex justify-center items-center pt-5 flex-col">
                      <h4 className="text-6xl font-black text-[#222]">
                        {averages[department.name].totalScore.toFixed(2)}
                      </h4>
                      <h4 className="text-xl">
                        {averages[department.name].employeeName}
                      </h4>
                      <h4 className="text-gray-500">
                        {averages[department.name].position}
                      </h4>
                      <h4 className="font-bold">
                        <span className="font-medium text-darkText">
                          Evaluaciones:{" "}
                        </span>
                        {averages[department.name].evaluationsCount}
                      </h4>
                      <button className="bg-primary hover:bg-primary-dark text-white font-bold py-1 px-2 rounded-md mt-2">
                        <Link
                          to={`/empleado/${
                            averages[department.name].employeeId
                          }`}
                        >
                          Ir al perfil
                        </Link>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center  flex-1 items-center pt-5 flex-col">
                    <h2 className="text-gray-400 font-bold text-3xl text-center">
                      Aún no hay evaluaciones...
                    </h2>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
