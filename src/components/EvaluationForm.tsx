import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import getPastMonthRange from "@/utils/getPastMonthRange";
import { XIcon } from "lucide-react";
import formatDateForDisplay from "@/utils/formatDateForDisplay";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { formatScore } from "@/utils/scoreUtils";

export default function EvaluationForm({
  userId,
  employeeId,
  employeePosition,
  employeeName,
  setTableIsLoading,
  evaluationId,
}: {
  userId: string;
  employeeId: string;
  employeePosition: string | undefined;
  employeeName: string;
  setTableIsLoading: (value: boolean) => void;
  evaluationId?: string;
}) {
  const [disabledForm, setDisabledForm] = useState(!!evaluationId);

  const methods = useForm({
    disabled: disabledForm,
    defaultValues: {
      responses: {},
      comment: "",
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const { firstDay, lastDay } = getPastMonthRange();
  const [questions, setQuestions] = useState<any[] | []>([]);
  const [evaluationData, setEvaluationData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  var commentCharacters = 400 - methods.watch("comment")?.length;

  const setAnswers = (
    retrievedAnswers: [{ question_id: number; response: number }]
  ) => {
    retrievedAnswers.forEach(
      (answer: { question_id: number; response: number }) => {
        methods.setValue("responses", {
          ...methods.getValues("responses"),
          [answer.question_id]: answer.response,
        });

        console.log(methods.watch("responses"));
      }
    );
    setDisabledForm(true);
  };

  const getQuestions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("question_positions")
      .select("id:question_id, position_id, ...questions(text)")
      .eq("position_id", employeePosition);

    if (error) {
      console.log(error);
      return;
    }
    if (data) {
      console.log(data);
      setQuestions(data);
    }
    setIsLoading(false);
  };

  const getAnswers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("evaluation_sessions")
      .select(
        "*, evaluation_responses!evaluation_id(*), comment:evaluation_comments!evaluation_id(comment)"
      )
      .eq("id", evaluationId)
      .single();

    if (error) {
      console.log(error);
      return;
    }
    console.log({ data });
    console.log("setting answers");
    setAnswers(data.evaluation_responses);

    setEvaluationData({
      totalScore: data.total_score,
      period: data.period,
    });

    methods.setValue("comment", data.comment[0]?.comment);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      getQuestions();
      if (evaluationId) {
        getAnswers();
      }
    }
  }, [isOpen]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    const totalScore: number =
      ((Object.values(data.responses) as number[]).reduce(
        (acc: number, agg: number) => {
          return acc + agg;
        },
        0
      ) /
        (questions.length * 5)) *
      5;
    const { data: createData, error: createError } = await supabase
      .from("evaluation_sessions")
      .insert({
        manager_id: userId,
        employee_id: employeeId,
        period: firstDay,
        total_score: totalScore,
      })
      .select("id")
      .single();

    if (createError) {
      console.log(createError);
      return;
    }

    console.log(createData);
    Object.keys(data.responses).forEach(async (questionId) => {
      const { error: responsesError } = await supabase
        .from("evaluation_responses")
        .insert({
          response: data.responses[questionId],
          question_id: questionId,
          evaluation_id: createData.id,
        });

      if (responsesError) {
        console.log(responsesError);
        return;
      }
    });

    const { error: commentError } = await supabase
      .from("evaluation_comments")
      .insert({
        comment: data.comment,
        evaluation_id: createData.id,
      });

    if (commentError) {
      console.log(commentError);
      return;
    }

    toast.success("Evaluación enviada.", {
      position: "bottom-right",
      autoClose: 1000,
    });
    setIsOpen(false);
    setTableIsLoading(true);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const response = await supabase
      .from("evaluation_sessions")
      .delete()
      .eq("id", evaluationId);

    if (response.error) {
      console.log(response.error);
      return;
    }
    toast.success("Evaluación eliminada.", {
      position: "bottom-right",
      autoClose: 1000,
    });
    setIsOpen(false);
    setTableIsLoading(true);
  };

  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setIsOpen(true);
              methods.setValue("responses", {});
            }}
            variant="outline"
          >
            {evaluationId ? "Ver evaluación" : "Evaluar"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[725px] [&>button]:hidden ">
          <DialogClose asChild={true}>
            <XIcon
              className="absolute right-5 top-5  flex flex-row justify-self-end cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                methods.setValue("responses", {});
              }}
            />
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Evaluación a {employeeName}</DialogTitle>
            <DialogDescription className="font-light">
              Período: {formatDateForDisplay(firstDay)} -{" "}
              {formatDateForDisplay(lastDay)}
            </DialogDescription>
            {evaluationData && (
              <h3 className="scroll-m-20 text-md font-semibold tracking-tight">
                Puntaje promedio:{" "}
                <span>{evaluationData.totalScore.toFixed(2)}</span>
              </h3>
            )}
          </DialogHeader>

          {questions.length > 0 ? (
            <FormProvider {...methods}>
              <form
                aria-disabled={disabledForm}
                className="max-w-full w-full"
                onSubmit={methods.handleSubmit(handleSubmit)}
              >
                <EvaluationList
                  evaluationId={evaluationId}
                  questions={questions}
                />
                <div>
                  <div className="flex flex-row items-center justify-start pt-5 ">
                    <h3 className="font-bold mb-1">Comentario</h3>
                    {!evaluationId && (
                      <span
                        className={`${
                          commentCharacters > 80
                            ? "text-neutral-400"
                            : commentCharacters > 20
                            ? "text-yellow-500"
                            : commentCharacters > 0
                            ? "text-red-500"
                            : "text-red-700"
                        } ml-2`}
                      >
                        {commentCharacters}/400
                      </span>
                    )}
                  </div>
                  <textarea
                    maxLength={400}
                    className="w-full h-24 border border-gray-300 rounded-md p-2 overflow-y-scroll"
                    placeholder="Escribe un comentario..."
                    disabled={!!evaluationId}
                    {...methods.register("comment", { maxLength: 400 })}
                  />
                </div>
                <DialogFooter className="pt-2">
                  {!!evaluationId ? (
                    <Button
                      onClick={() => {
                        handleDelete();
                      }}
                      variant={"destructive"}
                      type="button"
                    >
                      Eliminar evaluación
                    </Button>
                  ) : (
                    <Button
                      disabled={
                        Object.keys(methods.watch("responses")).length !==
                          questions?.length ||
                        !!evaluationId ||
                        questions.length === 0 ||
                        isLoading
                      }
                      className="bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-700"
                      variant={"outline"}
                      type="submit"
                    >
                      Enviar
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </FormProvider>
          ) : isLoading ? (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex items-center justify-center p-10 bg-gray-100 rounded-md">
              <h3 className="scroll-m-20 text-md font-semibold text-gray-600">
                No hay preguntas para este cargo.
              </h3>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

//TODO: MOve this component to its own file
const EvaluationList = ({
  questions,
  evaluationId,
}: {
  questions: any[] | null;
  evaluationId?: string;
}) => {
  const { setValue, getValues, watch } = useFormContext();

  const handleChange = (questionId: number, value: number) => {
    console.log({ questionId, value });
    setValue("responses", { ...getValues("responses"), [questionId]: value });
    console.log(watch("responses"));
  };
  return (
    <div className="overflow-y-scroll md:max-h-[200px] lg:max-h-[300px] xl:max-h-[350px] xxl:max-h-[600px]">
      {questions &&
        questions.map((question) => {
          console.log(question);
          return (
            <div
              className="border p-2 text-center my-2 rounded-md hover:bg-gray-100"
              key={question.id}
            >
              <div className="pb-2">
                <h2>{question.text}</h2>
              </div>
              <div className="grid grid-cols-5 border-t pt-3">
                {[...Array(5)].map((_, index) => {
                  return (
                    <div className="flex flex-col  items-center" key={index}>
                      <label
                        className="flex flex-col items-center text-sm gap-1"
                        htmlFor={`responses.${question.id}.${index}`}
                      >
                        <input
                          // name={`responses.${question.id}`}
                          id={`responses.${question.id}.${index}`}
                          type="radio"
                          value={index + 1}
                          // {...register(`responses.${question.id}`)}
                          checked={
                            watch(`responses.${question.id}`) == index + 1
                          }
                          onChange={() => {
                            handleChange(question.id, index + 1);
                          }}
                          disabled={!!evaluationId}
                          className="bg-white peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-400 checked:border-slate-500 checked:bg-primary  transition-all disabled:cursor-not-allowed
                          disabled:checked:bg-gray-400"
                        />

                        {
                          <>
                            <span>{formatScore(index + 1)}</span>
                            <span>{index + 1}</span>
                          </>
                        }
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};
