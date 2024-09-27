import { useEffect, useState } from "react";
import { FaClipboardCheck, FaUser } from "react-icons/fa";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";
import { useUserStore } from "../stores/useUserStore";
import EvaluatedBadge from "../components/EvaluatedBadge";
import { canEvaluate } from "../utils/canEvaluate";
import { determineBadge } from "../utils/determineBadge";
import getPastMonthRange from "../utils/getPastMonthRange";
import formatDateForDisplay from "../utils/formatDateForDisplay";
import EvaluateModal from "../components/EvaluateModal";
import { useNavigate } from "react-router-dom";

interface Evaluations {
  avg: number;
}
interface Department {
  name: string;
}
interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
  department_id: number;
  departments: Department;
  role: string;
  avg_evaluations: Evaluations;
  recent_evaluation_date: string;
  privileges: number;
}

export default function Team() {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const retrieveEmployees = async () => {
    //Get the data from all the employees
    const { data: employeeData, error: employeeError } = await supabase
      .from("users")
      .select(
        `user_id,first_name,last_name,department_id,role,privileges,departments(name),avg_evaluations:evaluations!target_employee(total_rate.avg())`
      )
      .order("departments(name)", { ascending: false });

    if (employeeError) {
      console.log(employeeError.message);
      setLoadingData(false);
      return;
    }

    //Check if the employee X has been evaluated by the logged user in the current month
    const today = new Date();
    const startOfMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const { firstDay, lastDay } = getPastMonthRange();

    console.log({ startOfMonth });
    if (user === null) {
      console.log("user doesnt exist!");
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

    console.log({ evaluationData });

    if (evaluationError) {
      console.log(evaluationError);
      setLoadingData(false);
      return;
    }

    // Step 3: Combine Employee Data with Recent Evaluation Date
    const combinedData = employeeData.map((employee) => {
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

    console.log({ combinedData });
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
  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-200 mt-10 shadow-md rounded-lg">
      {/* <p>{JSON.stringify(user)}</p> */}
      <h1 className="text-slate-900 text-4xl uppercase font-black">
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
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nombre y apellido
                </th>
                <th scope="col" className="px-6 py-3">
                  Departamento
                </th>
                <th scope="col" className="px-6 py-3">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3">
                  Promedio (<small>Histórico</small>)
                </th>
                <th scope="col" className="px-6 py-3">
                  Evaluación (<small>Este mes</small>)
                </th>
                <th scope="col" className="px-6 py-3">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="relative">
              {employees.map((employee) => {
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={employee.user_uid}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {`${employee.first_name} ${employee.last_name}`}
                    </th>
                    <td className="px-6 py-4">{employee.departments.name}</td>

                    <td className="px-6 py-4">{employee.role}</td>
                    <td className="px-6 py-4">
                      {parseFloat(employee.avg_evaluations[0].avg).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <EvaluatedBadge
                        badge={determineBadge(
                          user.privileges,
                          employee.privileges,
                          employee.recent_evaluation_date,
                          employee.last_name,
                          user.id,
                          employee.user_id
                        )}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row  ">
                        {canEvaluate(
                          user.privileges,
                          employee.privileges,
                          user.id,
                          employee.user_id
                        ) ? (
                          <>
                            <EvaluateModal
                              userData={user.id}
                              employeeData={{
                                id: employee.user_id,
                                name: `${employee.first_name} ${employee.last_name}`,
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
