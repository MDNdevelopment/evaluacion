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
import { Question } from "@/types";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

export default function EvaluationForm({
  userId,
  employeeId,
  employeePosition,
  employeeName,
  setTableIsLoading,
}: {
  userId: string;
  employeeId: string;
  employeePosition: string | undefined;
  employeeName: string;
  setTableIsLoading: (value: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { firstDay, lastDay } = getPastMonthRange();
  const [questions, setQuestions] = useState<Question[] | []>([]);

  const methods = useForm({
    defaultValues: {
      responses: {},
    },
  });

  const getQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*, question_positions(*)")
      .eq("question_positions.position_id", employeePosition);

    if (error) {
      console.log(error);
      return;
    }
    if (data) {
      setQuestions(data);
    }
  };

  useEffect(() => {
    console.log("EvaluationFORM RE RENDERED");
    if (isOpen) {
      getQuestions();
    }
  }, [isOpen]);

  const handleSubmit = async (data: any) => {
    console.log(data);
    console.log(userId);

    const totalScore: number =
      (Object.values(data.responses) as number[]).reduce(
        (acc: number, agg: number) => {
          return acc + agg;
        },
        0
      ) / questions.length;
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
  };

  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <Button
            className={`${employeePosition === "49" && "bg-red-600"}`}
            onClick={() => {
              setIsOpen(true);
              methods.setValue("responses", {});
            }}
            variant="outline"
          >
            Evaluar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[725px] [&>button]:hidden">
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
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
              <EvaluationList questions={questions} />

              <DialogFooter>
                <Button
                  disabled={
                    Object.keys(methods.watch("responses")).length !==
                    questions?.length
                  }
                  className="bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-700"
                  variant={"outline"}
                  type="submit"
                >
                  Enviar
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

const responseLabels = (response: number) => {
  switch (response) {
    case 1:
      return "Nunca";
    case 2:
      return "Casi nunca";
    case 3:
      return "A veces";
    case 4:
      return "Casi siempre";
    case 5:
      return "Siempre";
    default:
      return "Error";
  }
};

const EvaluationList = ({ questions }: { questions: Question[] | null }) => {
  const { setValue, getValues, watch, register } = useFormContext();

  const handleChange = (questionId: number, value: number) => {
    console.log({ questionId, value });
    setValue("responses", { ...getValues("responses"), [questionId]: value });
    console.log(watch("responses"));
  };
  return (
    <div className="overflow-y-scroll h-[400px]">
      {questions &&
        questions.map((question) => {
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
                    <div className="flex flex-col cursor-pointer" key={index}>
                      <input
                        name={`responses.${question.id}`}
                        id={`responses.${question.id}.${index}`}
                        type="radio"
                        value={index}
                        onChange={() => {
                          handleChange(question.id, index);
                        }}
                      />
                      <label
                        className="text-sm"
                        htmlFor={`responses.${question.id}.${index}`}
                      >
                        {responseLabels(index + 1)}
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
