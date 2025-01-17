import { useEffect, useState } from "react";
import { FaAngleDown, FaClipboardCheck, FaUser } from "react-icons/fa";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";
import { useUserStore } from "../stores/useUserStore";
import EvaluatedBadge from "../components/EvaluatedBadge";
import { canEvaluate } from "../utils/canEvaluate";
import { determineBadge } from "../utils/determineBadge";
import getPastMonthRange from "../utils/getPastMonthRange";
import EvaluateModal from "../components/EvaluateModal";
import { useNavigate } from "react-router-dom";

interface Evaluations {
  avg: number;
}
interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
  department_id: number;
  department_name: string;
  position: string;
  avg_evaluations: Evaluations;
  recent_evaluation_date: string;
  access_level: number;
  average_total_rate: number;
  evaluation_count: number;
}

export default function Team() {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const user = useUserStore((state) => state.user);
  const [evaluationsDirection, setEvaluationsDirection] =
    useState<boolean>(false);

  const [averagesDirection, setAveragesDirection] = useState<boolean>(false);
  const [departmentsDirection, setDepartmentsDirection] =
    useState<boolean>(false);
  const [badgeDirection, setBadgeDirection] = useState<boolean>(false);

  const navigate = useNavigate();
  const retrieveEmployees = async () => {
    //Get the data from all the employees
    const { data: employeeData, error: employeeError } = await supabase
      .from("user_evaluation_summary")
      .select(`*`);

    if (employeeError) {
      setLoadingData(false);
      return;
    }

    //Check if the employee X has been evaluated by the logged user in the current month
    const today = new Date();
    const startOfMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const { firstDay, lastDay } = getPastMonthRange();

    if (user === null) {
      return;
    }

    /*
    This will check the evaluations table to see if there is an evaluation made by the logged user, this will be the response cases:

    - there is no evaluations made
    - There is an evaluation made to the employee Y, but it was for the previous period, not the last one (so you can evaluate this employee)
    - There is an evaluation made to the employee Y and it was for the last period, iex: today is 01/09/2024 and the period on the table is period_start: 01/08/2024 and period_end: 31/08/2024 so you cannot evaluate this employee since you already did
    */
    const { data: evaluationData, error: evaluationError } = await supabase
      .from("evaluations")
      .select("target_employee,made_by,evaluated_at")
      .eq("made_by", user.id)
      .gte("evaluated_at", startOfMonth)
      .gte("period_start", firstDay)
      .lte("period_end", lastDay);

    if (evaluationError) {
      console.log(evaluationError);
      setLoadingData(false);
      return;
    }

    // Step 3: Combine Employee Data with Recent Evaluation Date
    const combinedData: any = employeeData.map((employee) => {
      const recentEvaluation = evaluationData.find(
        (evaluation) => evaluation.target_employee === employee.user_id
      );
      return {
        ...employee,
        recent_evaluation_date: recentEvaluation
          ? recentEvaluation.evaluated_at
          : null,
      };
    });

    setEmployees(combinedData);
    setLoadingData(false);

    setLoadingData(false);
  };

  useEffect(() => {
    //Get all the employees from the database
    if (!!user) {
      retrieveEmployees();
    }
  }, [user]);

  const sortEvaluations = () => {
    employees.sort(function (x, y) {
      if (x.evaluation_count < y.evaluation_count) {
        if (evaluationsDirection) {
          return -1;
        } else {
          return 1;
        }
      }

      if (x.evaluation_count > y.evaluation_count) {
        if (evaluationsDirection) {
          return 1;
        } else {
          return -1;
        }
      }

      return 0;
    });
    setEvaluationsDirection((state) => !state);
  };

  const sortAverages = () => {
    employees.sort(function (x, y) {
      if (x.average_total_rate < y.average_total_rate) {
        if (averagesDirection) {
          return -1;
        } else {
          return 1;
        }
      }

      if (x.average_total_rate > y.average_total_rate) {
        if (averagesDirection) {
          return 1;
        } else {
          return -1;
        }
      }

      return 0;
    });
    setAveragesDirection((state) => !state);
  };
  const sortDepartments = () => {
    employees.sort(function (x, y) {
      if (x.department_name < y.department_name) {
        if (departmentsDirection) {
          return -1;
        } else {
          return 1;
        }
      }

      if (x.department_name > y.department_name) {
        if (departmentsDirection) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    });
    setDepartmentsDirection((state) => !state);
  };

  const sortBadges = () => {
    employees.sort(function (x, y) {
      if (
        x.recent_evaluation_date < y.recent_evaluation_date ||
        (x.recent_evaluation_date === null && y.recent_evaluation_date)
      ) {
        if (badgeDirection) {
          return -1;
        } else {
          return 1;
        }
      }

      if (
        x.recent_evaluation_date > y.recent_evaluation_date ||
        (x.recent_evaluation_date && y.recent_evaluation_date === null)
      ) {
        if (badgeDirection) {
          return 1;
        } else {
          return -1;
        }
      }

      return 0;
    });
    setBadgeDirection((state) => !state);
  };
  return (
    <div className="max-w-[1200px] mx-auto p-10  mt-10 rounded-lg">
      {/* <p>{JSON.stringify(user)}</p> */}
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Empleados
      </h1>

      {loadingData || user === null ? (
        <div className="bg-white relative overflow-x-auto rounded-md mt-5 min-h-20 flex justify-center align-center pt-5">
          <Spinner />
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-md mt-5 ">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="">
                <th scope="col" className="px-6 py-3 text-center">
                  Nombre y apellido
                </th>
                <th
                  onClick={() => sortDepartments()}
                  scope="col"
                  className="px-6 py-3 text-center cursor-pointer"
                >
                  <div className="flex flex-row items-center justify-between">
                    <p>Departamento</p>{" "}
                    <FaAngleDown
                      className={`d-block
                        ${departmentsDirection ? " " : " rotate-180"}
                      `}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Rol
                </th>
                <th
                  onClick={() => sortEvaluations()}
                  scope="col"
                  className="px-6 py-3 text-center cursor-pointer  "
                >
                  <div className="flex flex-row items-center justify-between">
                    <p>Evaluaciones</p>{" "}
                    <FaAngleDown
                      className={`d-block
                        ${evaluationsDirection ? " " : " rotate-180"}
                      `}
                    />
                  </div>
                </th>
                <th
                  onClick={() => sortAverages()}
                  scope="col"
                  className="px-6 py-3 text-center cursor-pointer"
                >
                  <div className="flex flex-row items-center justify-between">
                    <p>Promedio</p>{" "}
                    <FaAngleDown
                      className={`d-block
                        ${averagesDirection ? " " : " rotate-180"}
                      `}
                    />
                  </div>
                </th>

                <th
                  onClick={() => sortBadges()}
                  scope="col"
                  className="px-6 py-3 text-center cursor-pointer"
                >
                  <div className="flex flex-row items-center justify-between">
                    <p>
                      Evaluación <br />(<small>Este mes</small>)
                    </p>{" "}
                    <FaAngleDown
                      className={`d-block
                        ${badgeDirection ? " " : " rotate-180"}
                      `}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="relative">
              {employees.map((employee) => {
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={employee.user_id}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {`${employee.first_name} ${employee.last_name}`}
                    </th>
                    <td className="px-6 py-4">{employee.department_name}</td>

                    <td className="px-6 py-4">{employee.position}</td>
                    <td className="px-6 py-4 text-center">
                      {employee.evaluation_count}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {employee.average_total_rate.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <EvaluatedBadge
                        badge={determineBadge(
                          user.access_level,
                          employee.access_level,
                          employee.recent_evaluation_date,
                          user.id,
                          employee.user_id
                        )}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row  ">
                        {canEvaluate(
                          user.access_level,
                          employee.access_level,
                          user.id,
                          employee.user_id
                        ) ? (
                          <>
                            <EvaluateModal
                              userData={user.id}
                              employeeData={{
                                id: employee.user_id,
                                name: `${employee.first_name} ${employee.last_name}`,
                                department: employee.department_id,
                              }}
                              retrieveEmployees={retrieveEmployees}
                            />
                          </>
                        ) : (
                          <FaClipboardCheck
                            size={22}
                            color={"#a5a5a5"}
                            className="mx-2 cursor-not-allowed"
                          />
                        )}

                        <FaUser
                          color="#222222"
                          size={22}
                          className="mx-2 cursor-pointer"
                          onClick={() => {
                            navigate(`/empleado/${employee.user_id}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
