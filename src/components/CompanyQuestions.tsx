import { useEffect, useState } from "react";
import { Company, Position } from "@/types";
import { supabase } from "@/services/supabaseClient";
import { QuestionDialog } from "./QuestionDialog";

export default function CompanyQuestions({ company }: { company: Company }) {
  const [questions, _setQuestions] = useState([]);
  const [positions, setPositions] = useState<{ [key: string]: Position[] }>({});

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("company_id", company.id);

    if (error) {
      console.log(error.message);
      return;
    }
    if (data && data.length > 0) {
      // setQuestions(data);
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
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchQuestions();
  }, [company]);
  return (
    <div className="mx-auto  w-full">
      <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Preguntas
      </h2>

      <div className="flex flex-row">
        <QuestionDialog positions={positions} company={company} />
      </div>
      <h3>Preguntas</h3>
      {JSON.stringify(questions)}
    </div>
  );
}
