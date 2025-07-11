import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { supabase } from "../services/supabaseClient";

import { useUserStore } from "../stores/useUserStore";
// import { toast } from "react-toastify";

import { EvaluationsGraphic } from "@/components/EvaluationsGraphic";
import { formatScore, representScore } from "@/utils/scoreUtils";
import EmployeeEvaluationsList from "@/components/EmpoloyeeEvaluationsList";
import { getMonthName } from "@/utils/getMonthName";
import { getScoreColor } from "@/utils/getScoreColor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getPastMonthRange from "@/utils/getPastMonthRange";
import AiEvaluation from "@/components/AiEvaluation";

import EmployeeFile from "@/components/EmployeeFile";
import formatDateForDisplay from "@/utils/formatDateForDisplay";
import dateDifference from "@/utils/dateDifference";
import translateVacationStatus from "../utils/translateVacationStatus";

export default function EmployeeProfile() {
  const { id } = useParams();
  const user = useUserStore((state) => state.user);

  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<any>(undefined);
  const [evaluationsData, setEvaluationsData] = useState<any>(null);
  const [pastMonthData, setPastMonthData] = useState<any>(null);
  const [evaluationsChart, setEvaluationsChart] = useState<any>([]);
  const [totalAverage, setTotalAverage] = useState<number | null>(null);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { firstDay } = getPastMonthRange();
  const [yearVacations, setYearVacations] = useState<any>(null);

  const retrieveEmployeeData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,departments(department_name),
        positions(position_name),
        vacations(*)`
      )
      .eq("user_id", id)
      .eq("company_id", user?.company_id)
      .single();

    if (error) {
      console.log(error.message);
      setEmployeeData(null);
      setIsLoading(false);
      return;
    }

    //Get the evaluations data
    const { data: evaluations, error: evaluationsError } = await supabase
      .from("evaluation_sessions")
      .select(
        "id, total_score, period, evaluation_responses(*, questionData:questions(text)), evaluation_comments(*) "
      )
      .eq("employee_id", id);

    if (evaluationsError) {
      console.log(evaluationsError.message);
      setIsLoading(false);
      return;
    }

    //Group evaluations by period
    const groupedEvaluationsByDate = evaluations?.reduce(
      (agg: any, curr: any) => {
        if (!agg[curr.period]) {
          agg[curr.period] = {
            totalEvaluations: 0,
            totalScore: 0,
            questions: {
              totalQuestions: 0,
              questionsData: [],
            },
            comments: [],
          };
        }

        agg[curr.period].totalEvaluations += 1;
        agg[curr.period].totalScore += curr.total_score;

        //If the comment exists, add it to that period
        if (curr.evaluation_comments[0].comment.length > 0) {
          agg[curr.period].comments.push(curr.evaluation_comments[0].comment);
        }

        curr.evaluation_responses.forEach((response: any) => {
          agg[curr.period].questions.totalQuestions += 1;
          if (
            !agg[curr.period].questions.questionsData.find(
              (question: any) => question.text === response.questionData.text
            )
          ) {
            agg[curr.period].questions.questionsData.push({
              text: response.questionData.text,
              totalResponses: 0,
              totalScore: 0,
              responses: [],
            });
          }

          const questionIndex = agg[
            curr.period
          ].questions.questionsData.findIndex(
            (question: any) => question.text === response.questionData.text
          );
          agg[curr.period].questions.questionsData[
            questionIndex
          ].totalResponses += 1;

          agg[curr.period].questions.questionsData[questionIndex].totalScore +=
            response.response;

          //Save all the responses for each question
          agg[curr.period].questions.questionsData[
            questionIndex
          ].responses.push({
            response: response.response,
            evaluationId: curr.id,
          });
        });

        return agg;
      },
      {}
    );

    //Calculate the total score for each question
    Object.keys(groupedEvaluationsByDate).forEach((key) => {
      groupedEvaluationsByDate[key].questions.questionsData.forEach(
        (question: any) => {
          question.totalScore = question.totalScore / question.totalResponses;
        }
      );
    });

    //Calculate the total score for each period
    Object.keys(groupedEvaluationsByDate).forEach((key) => {
      groupedEvaluationsByDate[key].totalScore =
        groupedEvaluationsByDate[key].totalScore /
        groupedEvaluationsByDate[key].totalEvaluations;
    });

    //Calculate the total average of all the evaluations
    const totalScoreAllTime =
      Object.keys(groupedEvaluationsByDate).reduce((agg: any, curr: any) => {
        agg += groupedEvaluationsByDate[curr].totalScore;
        return agg;
      }, 0) / Object.keys(groupedEvaluationsByDate).length;

    const chartData: any[] = [];
    //Set the chartData
    Object.keys(groupedEvaluationsByDate).forEach((key) => {
      const month: String = `${key.split("-")[1]} ${key.split("-")[0]}`;
      chartData.push({
        period: month,
        totalScore: groupedEvaluationsByDate[key].totalScore,
        totalEvaluations: groupedEvaluationsByDate[key].totalEvaluations,
        scoreResult: groupedEvaluationsByDate[key].totalScore.toFixed(2),
        formattedScore: representScore(
          parseFloat(groupedEvaluationsByDate[key].totalScore)
        ),
      });
    });

    // Helper function to parse the period into a Date object
    const parsePeriodToDate = (period: string) => {
      const [month, year] = period.trim().split(" ");
      return new Date(parseInt(year), parseInt(month)); // Create a Date object
    };

    // Sort the chartData based on the parsed date
    chartData.sort((a: any, b: any) => {
      const dateA = parsePeriodToDate(a.period);
      const dateB = parsePeriodToDate(b.period);
      return dateA.getTime() - dateB.getTime(); // Sort in ascending order
    });

    chartData.forEach((data: any) => {
      const [month, year] = data.period.split(" ");
      data.period = `${getMonthName(month)} ${year}`;
    });

    if (Object.keys(groupedEvaluationsByDate).length > 0) {
      setEvaluationsData(groupedEvaluationsByDate);
    }

    if (Object.keys(groupedEvaluationsByDate).includes(firstDay)) {
      setPastMonthData(groupedEvaluationsByDate[firstDay]);
    }

    //Set the states
    setTotalAverage(totalScoreAllTime);
    setEvaluationsChart(chartData);
    setEmployeeData(data);
    setYearVacations(
      data.vacations.find((vacation: any) =>
        vacation.start_date.includes(new Date().getFullYear().toString())
      )
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (id === undefined || user === null) {
      return;
    }

    if (user.access_level < 2 && user.id !== id) {
      navigate(`/empleado/${user.id}`);
      return;
    }
    setEvaluationsData(null);
    setTotalAverage(null);
    retrieveEmployeeData();
  }, [id, user]);

  if (isLoading || employeeData === undefined) {
    return (
      <div className="flex justify-center items-center h-[10rem]">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && employeeData === null) {
    return (
      <div className="flex justify-center items-center h-[10rem]">
        <h2 className="text-gray-500 text-lg italic">
          No se encontró el empleado
        </h2>
      </div>
    );
  }
  return (
    <div className="max-w-[1200px] mx-auto p-5 lg:p-10 lg:mt-10  rounded-lg ">
      <div className="flex lg:flex-row flex-col">
        <div className="w-full lg:w-2/5  lg:pr-5 flex flex-col justify-between items-center lg:items-start ">
          <div className=" w-full  flex flex-row justify-between items-center relative">
            <div className="  flex flex-col lg:flex-row  items-center  w-full gap-5">
              <div className="shrink-0 flex-2 lg:w-2/6 h-36 mt-5 lg:mt-0 object-cover aspect-square ">
                <div className="  h-40 w-40 md:w-32 md:h-32  lg:h-32 lg:w-32 xl:w-36 xl:h-36 rounded-full overflow-hidden mx-auto">
                  <img
                    alt=""
                    src={
                      employeeData.avatar_url ||
                      "https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/user-profile.png"
                    }
                    className="h-full w-full object-cover mx-auto aspect-square"
                  />
                </div>
              </div>

              <div className=" flex flex-1 flex-col pl-0  lg:pl-5 lg:items-stretch lg:w-4/6 pt-5 pb-5 ">
                <h1 className="text-center lg:text-left text-darkText text-3xl uppercase font-black">
                  {employeeData.first_name} <br /> {employeeData.last_name}
                </h1>

                <h4 className="text-gray-800 text-md text-center lg:text-left">
                  {employeeData.departments.department_name} -{" "}
                  {employeeData.positions.position_name}
                </h4>
                <div className="pt-2">
                  <EmployeeFile
                    isFileOpen={isFileOpen}
                    setIsFileOpen={setIsFileOpen}
                    employeeData={{
                      name: {
                        title: "Nombre",
                        data: `${employeeData.first_name} ${employeeData.last_name}`,
                        admin: false,
                      },
                      position: {
                        title: "Cargo",
                        data: employeeData.positions.position_name,
                        admin: false,
                      },
                      department: {
                        title: "Departamento",
                        data: employeeData.departments.department_name,
                        admin: false,
                      },
                      email: {
                        title: "Email",
                        data: employeeData.email,
                        admin: false,
                      },

                      phone: {
                        title: "Teléfono",
                        data: employeeData.phone_number || "N/A",
                        admin: false,
                      },
                      birthdate: {
                        title: "Fecha de Nacimiento",
                        data: employeeData.birth_date
                          ? formatDateForDisplay(employeeData.birth_date)
                          : "N/A",
                        admin: false,
                      },

                      vacations: {
                        title: "Vacaciones",
                        data: yearVacations
                          ? `${formatDateForDisplay(
                              yearVacations.start_date
                            )} - ${formatDateForDisplay(
                              yearVacations.end_date
                            )}`
                          : "",
                        admin: false,
                        difference: yearVacations
                          ? translateVacationStatus(yearVacations.status)
                          : translateVacationStatus(),
                      },
                      hireDate: {
                        title: "Fecha de Ingreso",
                        data: employeeData.hire_date
                          ? formatDateForDisplay(employeeData.hire_date)
                          : "N/A",
                        admin: true,

                        difference: employeeData.hire_date
                          ? dateDifference(employeeData.hire_date, new Date())
                          : "",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className=" mx-auto  pb-5 lg:pb-0 mt-10 lg:mt-0  w-full">
            <div className=" min-h-[7rem] flex flex-row bg-white shadow-sm border rounded-lg overflow-hidden">
              <div
                className={`${
                  totalAverage
                    ? getScoreColor(Math.floor(totalAverage))
                    : "bg-gray-400"
                } w-2/5 flex items-center justify-center`}
              >
                <div className="flex flex-col font-black text-center text-white text-4xl uppercase">
                  {totalAverage ? totalAverage.toFixed(2) : "N/A"}
                  {!!totalAverage && (
                    <span className="text-xs font-medium ">
                      (
                      {totalAverage &&
                        representScore(parseFloat(totalAverage.toFixed(2)))}
                      )
                    </span>
                  )}
                </div>
              </div>
              <div className="w-3/5 p-3  flex flex-col justify-center">
                <h4 className="font-bold">Promedio Total</h4>
                <p className="text-sm  text-gray-500">
                  Promedio generado a lo largo de los meses.
                </p>
              </div>
            </div>

            <div className="  min-h-[7rem] mt-3 flex flex-row bg-white shadow-sm border rounded-lg overflow-hidden">
              <div
                className={`${
                  pastMonthData
                    ? getScoreColor(pastMonthData.totalScore.toFixed(2))
                    : "bg-gray-400"
                } w-2/5 flex items-center justify-center`}
              >
                <div className="flex flex-col font-black text-center text-white text-4xl uppercase">
                  {pastMonthData ? pastMonthData.totalScore.toFixed(2) : "N/A"}

                  {!!totalAverage && (
                    <span className="text-xs font-medium ">
                      (
                      {evaluationsData &&
                        representScore(
                          parseFloat(pastMonthData?.totalScore.toFixed(2))
                        )}
                      )
                    </span>
                  )}
                </div>
              </div>
              <div className="w-3/5 p-3 flex flex-col justify-center">
                <h4 className="font-bold">Promedio actual</h4>
                <p className="text-sm  text-gray-500">
                  Promedio generado para el mes actual.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 w-full ">
          {" "}
          {<EvaluationsGraphic evaluationsArray={evaluationsChart} />}
        </div>
      </div>

      <AiEvaluation evaluations={evaluationsData} />

      {evaluationsData && (
        <div className="flex flex-col lg:flex-row">
          <Promedios current={pastMonthData} />
          <Promedios historic={evaluationsData} />
        </div>
      )}

      {user && user.admin && (
        <div className="mt-10">
          <h2 className="text-darkText text-xl  font-black mb-3">
            Evaluaciones hechas por{" "}
            {`${employeeData.first_name} ${employeeData.last_name}`}
          </h2>
          {user &&
          employeeData &&
          user.admin &&
          employeeData.access_level > 1 ? (
            <EmployeeEvaluationsList evaluatorId={employeeData.user_id} />
          ) : null}
        </div>
      )}

      <div className="mt-14">
        <h2 className="text-darkText text-xl  font-black mb-3">
          Evaluaciones hechas a{" "}
          {`${employeeData.first_name} ${employeeData.last_name}`}
        </h2>
        <EmployeeEvaluationsList employeeId={employeeData.user_id} />
      </div>
    </div>
  );
}

const Promedios = ({
  current,
  historic,
}: {
  current?: any;
  historic?: any;
}) => {
  const [answersAvg, setAnswersAvg] = useState<any>([]);

  const calculateHistoricAvg = (questions: any) => {
    const avg = Object.keys(questions).reduce((acc: any, period: any) => {
      const periodData = questions[period];
      if (
        !periodData ||
        !periodData.questions ||
        !periodData.questions.questionsData
      ) {
        console.warn("Missing questions data for period:", period);
        return acc;
      }

      const questionsData = periodData.questions.questionsData;

      questionsData.forEach(
        (question: {
          text: string;
          responses: [
            {
              response: number;
              evaluationId: number;
            }
          ];
          totalResponses: number;
          totalScore: number;
        }) => {
          if (!acc[question.text]) {
            acc[question.text] = {
              totalResponses: 0,
              totalScore: 0,
              text: question.text,
            };
          }

          acc[question.text].totalResponses += 1;
          acc[question.text].totalScore += question.totalScore;
          acc[question.text].text = question.text;
        }
      );

      return acc;
    }, {});

    Object.keys(avg).forEach((question: any) => {
      avg[question].totalScore =
        avg[question].totalScore / avg[question].totalResponses;
    });

    const avgArray: {
      text: string;
      totalScore: number;
      totalResponses: number;
    }[] = [];
    Object.keys(avg).forEach((question: any) => {
      avgArray.push(avg[question]);
    });
    avgArray.sort((a, b) => a.text.localeCompare(b.text));

    setAnswersAvg(avgArray);
  };

  useEffect(() => {
    if (!current && !historic) {
      return;
    }
    if (historic) {
      calculateHistoricAvg(historic);
      return;
    }

    setAnswersAvg(current.questions.questionsData);
  }, [historic, current]);

  return (
    <Card className=" lg:mx-3 w-full lg:w-3/6 max-h-[600px] overflow-y-auto mt-10">
      <CardHeader>
        <CardTitle>
          Promedio de preguntas{" "}
          {current !== undefined ? "en este período" : "histórico"}
        </CardTitle>
        <CardDescription>
          Promedio de resultados obtenidos en cada pregunta durante{" "}
          {current !== undefined ? "el período actual" : "todos los períodos"}.
        </CardDescription>
        <CardContent className="p-0">
          {answersAvg && answersAvg.length > 0 ? (
            answersAvg.map((question: any) => {
              return (
                <div
                  className="flex flex-row items-stretch justify-between mb-2 rounded-sm overflow-hidden bg-gray-100"
                  key={question.text}
                >
                  <div className=" w-4/6 p-2">
                    <h4 className="text-sm font-bold ">Pregunta</h4>
                    <span className="text-sm">{question.text}</span>
                  </div>

                  <div
                    className={`${getScoreColor(
                      question.totalScore.toFixed(2)
                    )} text-white p-2 flex flex-col items-center justify-between  w-2/6 `}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-lg font-black ">
                        {question.totalScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-center">
                        (
                        {formatScore(
                          parseFloat(question.totalScore.toFixed(2))
                        )}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 rounded-md bg-gray-200 flex flex-col items-center justify-center w-full h-full">
              <h4 className="text-sm text-gray-500">
                No hay datos disponibles
              </h4>
            </div>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
};
