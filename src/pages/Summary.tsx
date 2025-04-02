import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../services/supabaseClient";
import { FaAngleDown, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function Summary() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  const [evaluationsDirection, setEvaluationsDirection] =
    useState<boolean>(false);

  const [averagesDirection, setAveragesDirection] = useState<boolean>(false);
  const [departmentsDirection, setDepartmentsDirection] =
    useState<boolean>(false);

  const sortEvaluations = () => {
    data.sort(function (x: any, y: any) {
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
    data.sort(function (x: any, y: any) {
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
    data.sort(function (x: any, y: any) {
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
  const { register, handleSubmit, watch } = useForm();

  const onSubmit = handleSubmit(async (data: any) => {
    setIsLoading(true);
    const periodDate = `${data.year}-${String(data.month).padStart(2, "0")}-01`;
    const { data: periodData, error } = await supabase.rpc(
      "employee_evaluation_summary_for_period",
      { start_date_param: periodDate }
    );

    if (error) {
      console.error("Error fetching evaluation summary:", error);
      return null;
    }
    if (periodData.length === 0) {
      console.log("No data found");
      setData(null);
      setIsLoading(false);
    }

    periodData.sort(function (x: any, y: any) {
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
    setData(periodData);
    console.log(periodData);
    setIsLoading(false);
  });

  useEffect(() => {
    onSubmit();
  }, [watch("month"), watch("year")]);
  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-100 mt-10 shadow-md rounded-lg">
      <h1 className="text-primary text-4xl uppercase font-black">
        Resumen de evaluaciones
      </h1>
      <form className=" w-full flex justify-center mt-5">
        <select
          className="cursor-pointer py-2 px-4 mx-1 bg-white"
          {...register("month")}
        >
          <option value={1} selected>
            Enero
          </option>
          <option value={2}>Febrero</option>
          <option value={3}>Marzo</option>
          <option value={4}>Abril</option>
          <option value={5}>Mayo</option>
          <option value={6}>Junio</option>
          <option value={7}>Julio</option>
          <option value={8}>Agosto</option>
          <option value={9}>Septiembre</option>
          <option value={10}>Octubre</option>
          <option value={11}>Noviembre</option>
          <option value={12}>Diciembre</option>
        </select>

        <select
          className="cursor-pointer py-2 px-4 mx-1 bg-white"
          {...register("year")}
        >
          {Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (
            <option key={2024 + i} value={2024 + i} selected={i === 1}>
              {2024 + i}
            </option>
          ))}
        </select>
      </form>

      <div className="overflow-x-auto">
        <table className="overflow-x-auto mt-5 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
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

              <th>Acción</th>
            </tr>
          </thead>

          {!isLoading && data && data.length > 0 && (
            <tbody className="relative">
              {data.map((employee: any) => {
                console.log(employee);
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

                    <td className="px-6 py-4">{employee.position_name}</td>
                    <td className="px-6 py-4 text-center">
                      {employee.evaluation_count}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {employee.average_total_rate.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-row  ">
                        <FaUser
                          color="#222222"
                          size={22}
                          className="mx-2 cursor-pointer"
                          onClick={() => {
                            navigate(`/empleado/${employee.target_employee}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {isLoading && (
        <div>
          <div className="bg-white flex justify-center items-center w-full py-5">
            <Spinner />
          </div>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="bg-white flex justify-center items-center w-full py-5">
          <p>No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
}
