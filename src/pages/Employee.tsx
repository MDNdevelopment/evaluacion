import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import formatDateToSpanishMonthYear from "../utils/formatDateToSpanishPeriod";
import RecentEvaluations from "../components/RecentEvaluations";

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
  const colors = [
    "#F4B000", // Vibrant Yellow
    "#8884d8", // Soft Indigo
    "#82ca9d", // Soft Green
    "#FF6347", // Tomato Red
    "#4682B4", // Steel Blue
    "#FF69B4", // Hot Pink
    "#ff0048", // Orange
    "#222222",
  ];

  const categories = {
    period: "Período",
    quality: "Calidad",
    commitment: "Compromiso",
    initiative: "Iniciativa",
    customer_service: "Comunicación efectiva",
    process_tracking: "Cumplimiento de procesos",
    responsibility: "Responsabilidad",
    total_rate: "Promedio total",
    total_evaluations: "Evaluaciones",
  };

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
  const [employeeData, setEmployeeData] = useState<any>();
  const [evaluationsData, setEvaluationsData] = useState<any>();
  const [totalAverage, setTotalAverage] = useState<number | null>();
  const [averages, setAverages] = useState<any>(null);

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
      let total = 0.0;
      let finalIndex = 0;
      aggregatedEvaluations.map((evaluation: Evaluation, index: number) => {
        const currentRate = evaluation.total_rate;
        total = total + currentRate;
        finalIndex = index + 1;
      });

      const totalAverage = total / finalIndex;
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

  const MyChart = ({ evaluationsData }: any) => {
    // Assuming evaluationsData is an array of objects
    const dataKeys =
      evaluationsData.length > 0 ? Object.keys(evaluationsData[0]) : [];

    // Filter out keys that you don't want to include as lines
    const metricKeys = dataKeys.filter(
      (key) => key !== "period" && key !== "made_by"
    );

    return (
      <ResponsiveContainer width="95%" height={300}>
        <LineChart data={evaluationsData}>
          {metricKeys.map((key: string, index) => {
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                name={Object.values(categories)[index + 1]}
              />
            );
          })}
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="period" />
          <YAxis type="number" tickCount={6} />
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-100 mt-10 shadow-md rounded-lg">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-primary text-5xl uppercase font-black">
            {employeeData.first_name} {employeeData.last_name}
          </h1>
          <h4 className="text-gray-800 mb-10">
            {employeeData.departments.name} - {employeeData.role}
          </h4>
        </div>

        <div>
          <h3 className="text-gray-800 font-black text-2xl">
            Promedio Total: {totalAverage ? totalAverage.toFixed(2) : 0}
          </h3>
        </div>
      </div>

      {evaluationsData && <MyChart evaluationsData={evaluationsData} />}

      <div className="mt-10">
        <h2 className="text-slate-800 text-3xl uppercase font-black mb-5">
          Histórico:
        </h2>
        <div className="grid grid-cols-3 grid-rows-2 gap-5 content-center">
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Calidad
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.quality_avg ? averages.quality_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Responsabilidad
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.responsibility_avg
                ? averages.responsibility_avg.toFixed(2)
                : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Compromiso <br /> institucional
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.commitment_avg ? averages.commitment_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark mb-5">
              Iniciativa
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.initiative_avg ? averages.initiative_avg.toFixed(2) : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Comunicación <br /> efectiva
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.customer_service_avg
                ? averages.customer_service_avg.toFixed(2)
                : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
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

      <RecentEvaluations
        evaluationsData={evaluationsData[evaluationsData.length - 1]}
      />
    </div>
  );
}
