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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import getPastMonthRange from "@/utils/getPastMonthRange";
import { XIcon } from "lucide-react";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

export default function EvaluationForm({
  userId,
  userPosition,
  userName,
}: {
  userId: string;
  userPosition: string | undefined;
  userName: string;
}) {
  type CheckedState = {
    [key: string]: {
      name: string;
      value: boolean;
      category: string;
      category_id: number;
      question_id: number;
    };
  };

  const [questions, setQuestions] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [categories, setCategories] = useState<any>([]);
  const [checkedState, setCheckedState] = useState<any>({});
  const { firstDay, lastDay } = getPastMonthRange();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const organizeQuestions = (questions: any) => {
    console.log({ preguntass: questions });
    const organizedQuestions = questions.reduce((acc: any, question: any) => {
      if (!acc[question.categories.name]) {
        acc[question.categories.name] = [];
      }
      acc[question.categories.name].push({
        id: question.id,
        text: question.text,
        category: question.categories.name,
        category_id: question.category_id,
      });
      return acc;
    }, {});

    return organizedQuestions;
  };

  const initializeCheckedState: any = (questions: any) => {
    const initialCheckedState: CheckedState = {};
    Object.keys(questions).forEach((category) => {
      questions[category].forEach((question: any) => {
        initialCheckedState[question.id] = {
          name: question.text,
          value: false,
          category: category,
          category_id: question.category_id,
          question_id: question.id,
        };
      });
    });
    setCheckedState(initialCheckedState);
    console.log({ initialCheckedState });
  };

  const getQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*, categories(name)")
      .eq("position", userPosition);

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      console.log(data);
      if (data.length === 0) {
        setIsOpen(false);
        toast.error("No hay preguntas para este cargo.", {
          position: "bottom-right",
        });
        return;
      }
      const finalQuestions = organizeQuestions(data);
      setQuestions(finalQuestions);
      setCategories(Object.keys(finalQuestions));
      initializeCheckedState(finalQuestions);
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (questionId: number) => {
    console.log(`Pressed for question ${questionId}`);
    setCheckedState((prevState: CheckedState) => ({
      ...prevState,
      [questionId]: {
        name: prevState[questionId].name,
        value: !prevState[questionId].value,
        category: prevState[questionId].category,
        category_id: prevState[questionId].category_id,
        question_id: prevState[questionId].question_id,
      },
    }));
  };

  useEffect(() => {
    if (isOpen) {
      getQuestions();
      setCurrentStep(0);
    }
  }, [isOpen]);

  const renderCurrentCategory = () => {
    return (
      <>
        <div className="bg-primary mx-[-24px] py-3 flex items-center justify-center">
          <h4 className="font-bold uppercase text-white text-3xl">
            {categories[currentStep]}
          </h4>
        </div>

        <ol className="list-decimal">
          {questions &&
            categories &&
            questions[categories[currentStep]]?.map((question: any) => {
              return (
                <li key={question.text} className="flex flex-row mt-5">
                  <Checkbox
                    id={question.text}
                    name={question.text}
                    checked={checkedState[question.id].value}
                    onCheckedChange={() => handleCheckboxChange(question.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={question.text}
                      className="text-md font-regular leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
                    >
                      {question.text}
                    </label>
                  </div>
                </li>
              );
            })}
        </ol>
      </>
    );
  };

  const handleNextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log({ checkedState });
    //I need to calculate how many questions there are for each category and calculate the score based in how many questions are checked in that category
    let categoriesScores = categories.map((category: any) => {
      const questionsInCategory = questions[category].length;
      const checkedQuestions = Object.values(checkedState).filter(
        (question: any) => question.category === category && question.value
      ).length;
      return {
        category_id: questions[category][0].category_id,
        category: category,
        score: (checkedQuestions / questionsInCategory) * 10,
      };
    });

    categoriesScores = {
      ...categoriesScores,
      totalScore:
        categoriesScores.reduce(
          (acc: number, category: any) => acc + category.score,
          0
        ) / categoriesScores.length,
    };

    const { error } = await supabase.from("evaluations_sessions").insert({});
  };

  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)} variant="outline">
            Evaluar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[725px] [&>button]:hidden">
          <DialogClose asChild={true}>
            <XIcon
              className="absolute right-5 top-5  flex flex-row justify-self-end cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Evaluación a {userName}</DialogTitle>
            <DialogDescription>
              Período {firstDay} - {lastDay}
            </DialogDescription>
          </DialogHeader>
          {!isLoading ? (
            <>
              {renderCurrentCategory()}
              <DialogFooter>
                <button
                  onClick={() => {
                    handlePreviousStep();
                  }}
                  disabled={currentStep === 0}
                  className="bg-darkText text-white rounded-sm px-2 py-1 mr-5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => {
                    currentStep === categories.length - 1
                      ? handleSubmit()
                      : handleNextStep();
                  }}
                  className="bg-darkText text-white rounded-sm px-2 py-1 mr-5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {currentStep === categories.length - 1
                    ? "Finalizar"
                    : "Siguiente"}
                </button>
              </DialogFooter>
            </>
          ) : (
            <div className="w-full flex justify-center items-center">
              <Spinner />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
