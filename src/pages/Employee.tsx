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
    customer_service: "Atención al cliente",
    process_tracking: "Seguimiento de procesos",
    responsibility: "Responsabilidad",
    total_rate: "Promedio total",
    total_evaluations: "Evaluaciones",
  };

  // Helper function to convert 'month year' string to a valid Date object
  const monthNames = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dic: 11,
  };

  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState<any>();
  const [evaluationsData, setEvaluationsData] = useState<any>();
  const [averages, setAverages] = useState<any>(null);

  // const processEvaluations = (evaluations: any) => {
  //   const processedEvaluations = [];
  //   evaluations.map((evaluation) => {
  //     processedEvaluations.push({
  //       Período: formatDateToSpanishMonthYear(evaluation.period_end),
  //       Total: evaluation.total_rate,
  //       Calidad: evaluation.quality,
  //       Responsabilidad: evaluation.responsibility,
  //       "Compromiso institucional": evaluation.commitment,
  //       Iniciativa: evaluation.initiative,
  //       "Atención al cliente": evaluation.customer_service,
  //       "Seguimiento de procesos": evaluation.process_tracking,
  //     });
  //   });
  //   setEvaluationsData(processedEvaluations);
  //   console.log({ processedEvaluations });
  // };

  const retrieveEmployeeData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,departments(name),evaluations:evaluations!target_employee(quality, commitment, initiative, responsibility, process_tracking, customer_service, period_start, period_end, evaluated_at, total_rate),averages:evaluations!target_employee(quality_avg:quality.avg(), commitment_avg:commitment.avg(), initiative_avg:initiative.avg(), responsibility_avg:responsibility.avg(),process_tracking_avg:process_tracking.avg(),customer_service_avg:customer_service.avg(), total_rate_avg:total_rate.avg())`
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
    // processEvaluations(data.evaluations);

    const evaluationsByPeriod = data.evaluations.reduce((acc, evaluation) => {
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
      return acc;
    }, {});

    // Step 2: Calculate averages for each period
    const aggregatedEvaluations = Object.values(evaluationsByPeriod).map(
      (periodData) => {
        const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        console.log({ periodData });

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
        };
      }
    );

    console.log({ aggregatedEvaluations });

    const parsePeriod = (period) => {
      const [month, year] = period.split(" ");
      return new Date(year, monthNames[month.toLowerCase()]); // Creates a Date object with year and month
    };

    // Sorting the array
    const sortedData = aggregatedEvaluations.sort((a, b) => {
      const dateA = parsePeriod(a.period);
      const dateB = parsePeriod(b.period);
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

  const MyChart = ({ evaluationsData }) => {
    // Assuming evaluationsData is an array of objects
    const dataKeys =
      evaluationsData.length > 0 ? Object.keys(evaluationsData[0]) : [];

    // Filter out keys that you don't want to include as lines
    const metricKeys = dataKeys.filter((key) => key !== "period");

    return (
      <ResponsiveContainer width="95%" height={300}>
        <LineChart data={evaluationsData}>
          {metricKeys.map((key, index) => {
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                name={categories[key]}
              />
            );
          })}
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="period" />
          <YAxis type="number" interval="preserveStart" />
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-100 mt-10 shadow-md rounded-lg">
      <h1 className="text-primary text-5xl uppercase font-black">
        {employeeData.first_name} {employeeData.last_name}
      </h1>
      <h4 className="text-gray-800 mb-10">
        {employeeData.departments.name} - {employeeData.role}
      </h4>

      {/* <p>{JSON.stringify(employeeData)}</p> */}
      {evaluationsData && <MyChart evaluationsData={evaluationsData} />}

      <div className="mt-10">
        <h2 className="text-slate-800 text-3xl uppercase font-black mb-5">
          Categorias:
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
              Atención al <br /> cliente
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.customer_service_avg
                ? averages.customer_service_avg.toFixed(2)
                : 0}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center bg-white rounded-lg py-5">
            <h4 className="text-2xl font-bold text-primary-dark leading-none text-center mb-5">
              Seguimiento de <br /> procesos
            </h4>
            <p className="text-5xl text-darkText font-black">
              {averages.process_tracking_avg
                ? averages.process_tracking_avg.toFixed(2)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
