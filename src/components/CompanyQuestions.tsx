import { useEffect, useState } from "react";
import { Company, Position } from "@/types";
import { supabase } from "@/services/supabaseClient";
import QuestionsList from "./QuestionsList";

export default function CompanyQuestions({ company }: { company: Company }) {
  const [positions, setPositions] = useState<{ [key: string]: Position[] }>({});

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select(
        "company_id, id, name, ...departments(departmentId:department_id,departmentName:department_name)"
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
    console.log("COMPANY QUESTIONS RE RENDERED");

    fetchPositions();

    return;
  }, [company]);

  return (
    <div className="mx-auto  w-full">
      <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Preguntas
      </h2>

      <QuestionsList positions={positions} company={company} />
    </div>
  );
}
