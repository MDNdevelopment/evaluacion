import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";

import formatDateToSpanishMonthYear from "../utils/formatDateToSpanishPeriod";
import RecentEvaluations from "../components/RecentEvaluations";
import { useUserStore } from "../stores/useUserStore";
// import { toast } from "react-toastify";
import { EvaluationsChart } from "../components/EvaluationsChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { EvaluationsMadeBy } from "@/components/EvaluationsMadeBy";

interface Evaluation {
  commitment: number;
  customer_service: number;
  initiative: number;
  process_tracking: number;
  quality: number;
  responsibility: number;
  total_rate: number;
  evaluated_at: string;
  made_by: string;
  period_end: string;
  period_start: string;
  note: string;
}

export default function Employee() {
  const getMonth = (monthName: string) => {
    switch (monthName) {
      case "ene":
        return 0;

      case "feb":
        return 1;

      case "mar":
        return 2;

      case "abr":
        return 3;

      case "may":
        return 4;

      case "jun":
        return 5;

      case "jul":
        return 6;

      case "ago":
        return 7;
      case "sept":
        return 8;
      case "oct":
        return 9;
      case "nov":
        return 10;
      case "dic":
        return 11;
      default:
        return 0;
    }
  };

  const { id } = useParams();
  // const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<any>();
  const [evaluationsData, setEvaluationsData] = useState<any>();
  const [totalAverage, setTotalAverage] = useState<number | null>();
  const [averages, setAverages] = useState<any>(null);
  const user = useUserStore((state) => state.user);

  // const user = useUserStore((state) => state.user);

  const retrieveEmployeeData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,departments(name),evaluations:evaluations!target_employee(quality, commitment, initiative, responsibility, process_tracking, customer_service, period_start, period_end, evaluated_at, total_rate, made_by, note),averages:evaluations!target_employee(quality_avg:quality.avg(), commitment_avg:commitment.avg(), initiative_avg:initiative.avg(), responsibility_avg:responsibility.avg(),process_tracking_avg:process_tracking.avg(),customer_service_avg:customer_service.avg(), total_rate_avg:total_rate.avg())`
      )
      .eq("user_id", id)
      .single();

    if (error) {
      console.log(error.message);
      return;
    }
    setEmployeeData({ ...data });
    setEvaluationsData(data.evaluations);
    setAverages(data.averages[0]);

    const evaluationsByPeriod = data.evaluations.reduce(
      (acc: any, evaluation: Evaluation) => {
        const periodKey = `${evaluation.period_start}-${evaluation.period_end}`;

        if (!acc[periodKey]) {
          acc[periodKey] = {
            period_start: evaluation.period_start,
            period_end: evaluation.period_end,
            quality: [],
            commitment: [],
            initiative: [],
            total_rate: [],
            customer_service: [],
            process_tracking: [],
            responsibility: [],
            total_evaluations: 0,
            made_by: [],
          };
        }

        //Push each evaluation's metrics into arrays for that period
        acc[periodKey].quality.push(evaluation.quality);
        acc[periodKey].commitment.push(evaluation.commitment);
        acc[periodKey].initiative.push(evaluation.initiative);
        acc[periodKey].customer_service.push(evaluation.customer_service);
        acc[periodKey].process_tracking.push(evaluation.process_tracking);
        acc[periodKey].responsibility.push(evaluation.responsibility);
        acc[periodKey].total_rate.push(evaluation.total_rate);
        acc[periodKey].total_evaluations++;

        //Group each evaluation's date with the user who made it
        acc[periodKey].made_by.push([
          {
            date: evaluation.evaluated_at,
            user: evaluation.made_by,
            note: evaluation.note,
            quality: evaluation.quality,
            responsibility: evaluation.responsibility,
            commitment: evaluation.commitment,
            initiative: evaluation.initiative,
            customer_service: evaluation.customer_service,
            process_tracking: evaluation.process_tracking,
            categories: [
              evaluation.quality,
              evaluation.responsibility,
              evaluation.commitment,
              evaluation.initiative,
              evaluation.customer_service,
              evaluation.process_tracking,
            ],
          },
        ]);
        return acc;
      },
      {}
    );

    // Step 2: Calculate averages for each period
    const aggregatedEvaluations = Object.values(evaluationsByPeriod).map(
      (periodData: any) => {
        const average = (arr: any) =>
          arr.reduce((a: any, b: any) => a + b, 0) / arr.length;

        return {
          period: formatDateToSpanishMonthYear(periodData.period_end),
          quality: average(periodData.quality).toFixed(2),
          commitment: average(periodData.commitment).toFixed(2),
          initiative: average(periodData.initiative).toFixed(2),
          customer_service: average(periodData.customer_service).toFixed(2),
          process_tracking: average(periodData.process_tracking).toFixed(2),
          responsibility: average(periodData.responsibility).toFixed(2),
          total_rate: average(periodData.total_rate).toFixed(2),
          total_evaluations: periodData.total_evaluations,
          made_by: periodData.made_by,
        };
      }
    );

    //TODO: CALCULAR EL PROMEDIO TOTAL HISTORICO DEL EMPLEADO
    const calculateTotalAverage = (aggregatedEvaluations: any) => {
      const total = aggregatedEvaluations.reduce(
        (acc: any, evaluation: any) => acc + parseFloat(evaluation.total_rate),
        0
      );

      const totalEvaluations = aggregatedEvaluations.length;
      const totalAverage = total / totalEvaluations;
      setTotalAverage(totalAverage);
    };

    calculateTotalAverage(aggregatedEvaluations);

    const parsePeriod = (period: string) => {
      const [month, year] = period.split(" ");
      return new Date(parseInt(year), getMonth(month.toLowerCase())); // Creates a Date object with year and month
    };

    // Sorting the array
    const sortedData = aggregatedEvaluations.sort((a, b) => {
      const dateA: any = parsePeriod(a.period);
      const dateB: any = parsePeriod(b.period);
      return dateA - dateB;
    });

    setEvaluationsData(sortedData);
  };

  useEffect(() => {
    retrieveEmployeeData();
  }, [id]);
  if (!employeeData) {
    return (
      <div className="flex justify-center items-center h-[10rem]">
        <Spinner />
      </div>
    );
  }

  // const handleDelete = async () => {
  //   if (id) {
  //     const { error } = await supabase.from("users").delete().eq("user_id", id);

  //     if (error) {
  //       console.log(error.message);
  //       toast.error("Error al eliminar al empleado", {
  //         position: "bottom-right",
  //       });
  //       return;
  //     }

  //     // const { error: userError } = await supabase.auth.admin.deleteUser(id);

  //     // if (userError) {
  //     //   console.log(userError.message);
  //     //   toast.error("Error al eliminar al empleado", {
  //     //     position: "bottom-right",
  //     //   });
  //     //   return;
  //     // }
  //     toast.success("Empleado eliminado con éxito", {
  //       position: "bottom-right",
  //     });
  //     navigate("/empleados");
  //   }
  // };

  return (
    <div className="max-w-[1200px] mx-auto p-5 lg:p-10 bg-[#f7f7f7] lg:mt-10 shadow-md rounded-lg">
      <div className="flex lg:flex-row flex-col">
        <div className="w-full lg:w-2/5  lg:pr-5 flex flex-col justify-between items-center lg:items-start ">
          <div className=" w-full">
            <h1 className="text-darkText text-5xl uppercase font-black">
              {employeeData.first_name} <br /> {employeeData.last_name}
            </h1>
            <h4 className="text-gray-800">
              {employeeData.departments.name} - {employeeData.position}
            </h4>
            {/* {user && user.privileges === 4 && (
              <button
                onClick={() => {
                  // handleDelete();
                }}
                className="mt-2 bg-red-500 text-white rounded-md px-3 hover:bg-red-600 cursor-pointer"
              >
                Eliminar empleado
              </button>
            )} */}
          </div>
          <div className=" pt-10 mx-auto pb-5 lg:pb-0">
            <Card className=" flex-1 h-full flex flex-col justify-between">
              <div className="flex flex-row items-center pl-3">
                <CardContent className="py-1 px-2 bg-primary rounded-md text-white flex justify-center items-center text-2xl mx-auto w-fit font-bold">
                  {totalAverage ? totalAverage.toFixed(2) : 0}
                </CardContent>
                <CardHeader className="py-4">
                  <CardTitle>Promedio Total</CardTitle>
                  <CardDescription>
                    Promedio generado a lo largo de los meses
                  </CardDescription>
                </CardHeader>
              </div>

              <div className="border-b w-60 mx-auto " />

              <div className="flex flex-row items-center pl-3">
                <CardContent className="py-1 px-2 bg-primary rounded-md text-white flex justify-center items-center text-2xl mx-auto w-fit font-bold">
                  {evaluationsData.length > 0
                    ? evaluationsData[evaluationsData.length - 1].total_rate
                    : 0}
                </CardContent>
                <CardHeader className="py-4">
                  <CardTitle className="flex flex-row">
                    Promedio Actual{" "}
                    {evaluationsData.length > 1 &&
                    totalAverage &&
                    evaluationsData[evaluationsData.length - 1].total_rate <
                      totalAverage ? (
                      <FaArrowTrendDown
                        size={20}
                        className="ml-2 text-red-500"
                      />
                    ) : (
                      <FaArrowTrendUp
                        size={20}
                        className="ml-2 text-green-500"
                      />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Promedio generado para el mes actual
                  </CardDescription>
                </CardHeader>
              </div>
            </Card>
          </div>
        </div>
        <div className="lg:w-3/4 w-full">
          {" "}
          {evaluationsData && (
            <EvaluationsChart evaluationsData={evaluationsData} />
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-slate-800 text-3xl uppercase font-black mb-5">
          Histórico:
        </h2>
        <div className="lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-5 lg:content-center">
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Calidad
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.quality_avg ? averages.quality_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Responsabilidad
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.responsibility_avg
                ? averages.responsibility_avg.toFixed(2)
                : 0}
            </p>
          </div>
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Compromiso <br /> institucional
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.commitment_avg ? averages.commitment_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Iniciativa
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.initiative_avg ? averages.initiative_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Comunicación <br /> efectiva
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.customer_service_avg
                ? averages.customer_service_avg.toFixed(2)
                : 0}
            </p>
          </div>
          <div className="my-3 flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Cumplimiento de <br /> procesos
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.process_tracking_avg
                ? averages.process_tracking_avg.toFixed(2)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {user && user.role === "admin" && employeeData.access_level > 1 ? (
        <EvaluationsMadeBy employeeData={employeeData} />
      ) : null}

      <RecentEvaluations
        evaluationsData={evaluationsData[evaluationsData.length - 1]}
      />
    </div>
  );
}
