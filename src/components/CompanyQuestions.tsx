import { useEffect, useState } from "react";
import { Company, Position, Question } from "@/types";
import { supabase } from "@/services/supabaseClient";
import { QuestionDialog } from "./QuestionDialog";
import QuestionsList from "./QuestionsList";
import Spinner from "./Spinner";

export default function CompanyQuestions({ company }: { company: Company }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: Position[] }>({});
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select(
        "*, positions:question_positions(...positions(id, name)),tags:question_tags(id, tag)"
      )
      .eq("company_id", company.id);

    if (error) {
      console.log(error.message);
      return;
    }
    if (data && data.length > 0) {
      console.log(data);
      setQuestions(data);
    } else if (data && data.length === 0) {
      setQuestions([]);
    }
  };

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select(
        "company_id, id, name, ...departments(departmentId:id,departmentName:name)"
      )
      .eq("company_id", company.id);
    if (error) {
      console.log(error.message);
      return;
    }
    if (data && data.length > 0) {
      const organizedPositions = data.reduce((acc: any, curr: Position) => {
        const departmentName = curr.departmentName;
        if (!acc[departmentName]) {
          acc[departmentName] = [];
        }

        acc[departmentName].push(curr);

        return acc;
      }, {});
      setPositions(organizedPositions);
      setFetchingQuestions(false);
    }
  };

  useEffect(() => {
    if (!fetchingQuestions) return;
    fetchPositions();
    fetchQuestions();
    return;
  }, [company, fetchingQuestions]);
  return (
    <div className="mx-auto  w-full">
      <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Preguntas
      </h2>

      <div className="flex flex-row">
        <QuestionDialog
          setFetchingQuestions={setFetchingQuestions}
          positions={positions}
          company={company}
        />
      </div>

      {fetchingQuestions ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <QuestionsList
          setFetchingQuestions={setFetchingQuestions}
          questions={questions}
          positions={positions}
          company={company}
        />
      )}
    </div>
  );
}
