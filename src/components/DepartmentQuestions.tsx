import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

interface Question {
  id: Number;
  category_id: Number;
  text: string;
  position?: string;
}

export default function DepartmentQuestions({
  departmentId,
  position,
  isLoading,
  setIsLoading,
}: any) {
  const [questions, setQuestions] = useState<any[]>([]);

  const getQuestions = async () => {
    if (position) {
      const { data, error } = await supabase
        .from("positions_categories")
        .select(`categories(*, questions(*))`)
        .eq("position_id", position.id);

      if (error) {
        console.log(error.message);
        return;
      }

      setQuestions(data);
    } else {
      console.log("No company");
    }
  };

  useEffect(() => {
    setQuestions([]);
    if (departmentId !== null && position) {
      getQuestions();
      setIsLoading(false);
    }
  }, [departmentId, isLoading, position]);

  return (
    <div key={`${departmentId}-${position?.id}`}>
      {questions &&
        questions.length > 0 &&
        questions.map((category) => {
          return (
            <div
              className="rounded-md shadow-sm my-3 w-3/6 border border-gray-200 px-5 pb-3 pt-3"
              key={`${category.categories.name}-${category.categories.id}`}
            >
              <div className="flex flex-row justify-between border-b mb-3 pb-1">
                <h2 className="scroll-m-20  text-xl font-semibold tracking-tight first:mt-0 ">
                  {category.categories.name}
                </h2>
                <DeleteCategoryDialog
                  categoryId={category.categories.id}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  categoryName={category.categories.name}
                />
              </div>

              <ol className="list-decimal text-sm pl-5">
                {position &&
                  category.categories.questions.map((question: Question) => {
                    if (question.position === position.id) {
                      return (
                        <li className="my-2.5" key={`${question.id}`}>
                          <p className="">{question.text}</p>
                        </li>
                      );
                    }
                  })}
              </ol>
            </div>
          );
        })}
    </div>
  );
}
