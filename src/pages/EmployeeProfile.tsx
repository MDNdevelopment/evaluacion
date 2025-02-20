import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";

import { useUserStore } from "../stores/useUserStore";
// import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EvaluationsGraphic } from "@/components/EvaluationsGraphic";
import EmployeeEvaluationsList from "@/components/EmployeeEvaluationsList";
import { useEvaluationCheckStore } from "@/stores/useEvaluationCheckStore";
import remapMonths from "@/utils/remapMoths";

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState<any>();
  const [evaluationsData, setEvaluationsData] = useState<any>();
  const [evaluationsChart, setEvaluationsChart] = useState<any>();
  const [totalAverage, setTotalAverage] = useState<number | null>();
  // const [averages, setAverages] = useState<any>(null);
  const user = useUserStore((state) => state.user);
  const setEvaluation = useEvaluationCheckStore((state) => state.setEvaluation);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setEvaluation(null);
  }, [id]);

  // const user = useUserStore((state) => state.user);

  const retrieveEmployeeData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,departments(name),
        positions(name)`
      )
      .eq("user_id", id)
      .single();

    if (error) {
      console.log(error.message);
      return;
    }

    //Get the evaluations data
    const { data: evaluations, error: evaluationsError } = await supabase
      .from("evaluation_sessions")
      .select(
        "id, total_score, period, evaluation_responses(*, questionData:questions(text, categories(name))) "
      )
      .eq("employee_id", id);

    if (evaluationsError) {
      console.log(evaluationsError.message);
      return;
    }
    //Group evaluations by month
    const groupedEvaluations = evaluations?.reduce((agg: any, curr: any) => {
      if (!agg[curr.period]) {
        agg[curr.period] = [];
      }

      //Group the questions/answers by category for each evaluation
      const groupedResponses = curr.evaluation_responses.reduce(
        (responseAgg: any, responseCurr: any) => {
          const categoryName = responseCurr.questionData.categories.name;
          if (!responseAgg[categoryName]) {
            responseAgg[categoryName] = {
              questions: [],
              totalQuestions: 0,
              trueResponses: 0,
              score: 0,
            };
          }
          responseAgg[categoryName].questions.push({
            question: responseCurr.questionData.text,
            response: responseCurr.response,
          });

          responseAgg[categoryName].totalQuestions += 1;

          if (responseCurr.response) {
            responseAgg[categoryName].trueResponses += 1;
          }
          responseAgg[categoryName].score =
            (responseAgg[categoryName].trueResponses /
              responseAgg[categoryName].totalQuestions) *
            10;

          return responseAgg;
        },
        {}
      );

      agg[curr.period].push({
        ...curr,
        groupedResponses,
      });

      return agg;
    }, {});

    //Get the avg score for each category
    const summedEvaluations = Object.keys(groupedEvaluations).reduce(
      (agg: any, curr: any) => {
        let period = curr.slice(0, -3).split("-").reverse().join("-");
        period = `${remapMonths(period.split("-")[0])}-${period.split("-")[1]}`;
        if (!agg[curr]) {
          agg[curr] = {
            totalRate: 0,
            totalEvaluations: 0,
            categories: {},
            period: period,
          };
        }

        groupedEvaluations[curr].forEach((evaluation: any) => {
          Object.keys(evaluation.groupedResponses).forEach((category: any) => {
            if (!agg[curr].categories[category]) {
              agg[curr].categories[category] = {
                totalRate: 0,
                totalEvaluations: 0,
              };
            }

            agg[curr].categories[category].totalRate +=
              evaluation.groupedResponses[category].score;
            agg[curr].categories[category].totalEvaluations += 1;
          });
          agg[curr].totalRate += evaluation.total_score;
          agg[curr].totalEvaluations += 1;
        });

        //Calculate the average for each category
        Object.keys(agg[curr].categories).forEach((category: any) => {
          agg[curr].categories[category].average =
            //No estoy seguro pero creo que esta bien que divida el totalRate entre el total de evaluaciones de cada pregunta especifica porque puede que no todas las preguntas tengan la misma cantidad de evaluaciones si se hace un cambio en el periodo de evaluacion
            agg[curr].categories[category].totalRate /
            agg[curr].categories[category].totalEvaluations;
        });

        agg[curr].totalRate = (
          agg[curr].totalRate / agg[curr].totalEvaluations
        ).toFixed(2);

        return agg;
      },
      {}
    );

    const evaluationsArray = [];
    for (const key in summedEvaluations) {
      const element = summedEvaluations[key];

      evaluationsArray.push(element);
    }

    let calcTotalAverage = evaluationsArray.reduce((acc, curr) => {
      return acc + Number.parseFloat(curr.totalRate);
    }, 0);

    calcTotalAverage = calcTotalAverage / evaluationsArray.length;
    setTotalAverage(calcTotalAverage);
    setEvaluationsData(evaluationsArray);
    setEvaluationsChart(summedEvaluations);
    setIsLoading(false);
    setEmployeeData(data);
  };

  useEffect(() => {
    retrieveEmployeeData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[10rem]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-5 lg:p-10 bg-[#f7f7f7] lg:mt-10 shadow-md rounded-lg">
      <div className="flex lg:flex-row flex-col">
        <div className="w-full lg:w-2/5  lg:pr-5 flex flex-col justify-between items-center lg:items-start ">
          <div className=" w-full">
            <h1 className="text-darkText text-5xl uppercase font-black">
              {employeeData.first_name} <br /> {employeeData.last_name}
            </h1>
            <h4 className="text-gray-800">
              {employeeData.departments.name} - {employeeData.positions.name}
            </h4>
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
                    ? evaluationsData[evaluationsData.length - 1].totalRate
                    : 0}
                </CardContent>
                <CardHeader className="py-4">
                  <CardTitle className="flex flex-row">
                    Promedio Actual{" "}
                    {/* {evaluationsData.length > 1 &&
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
                    )} */}
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
          {<EvaluationsGraphic evaluationsData={evaluationsChart} />}
        </div>
      </div>

      <div className="mt-5">
        {user &&
        employeeData &&
        user.role === "admin" &&
        employeeData.access_level > 1 ? (
          <EmployeeEvaluationsList evaluatorId={employeeData.user_id} />
        ) : null}
      </div>

      <div className="mt-5">
        <EmployeeEvaluationsList employeeId={employeeData.user_id} />
      </div>
    </div>
  );
}
