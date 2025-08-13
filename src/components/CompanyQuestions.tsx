import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import QuestionsList from "./QuestionsList";
import { useCompanyStore } from "@/stores";

export default function CompanyQuestions() {
  const [positions, setPositions] = useState<{ [key: string]: any }>({});
  const company = useCompanyStore((state) => state.company);

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select(
        "company_id, position_id, position_name, ...departments(departmentId:department_id,departmentName:department_name)"
      )
      .eq("company_id", company?.id);
    if (error) {
      console.log(error.message);
      return;
    }
    if (data && data.length > 0) {
      const organizedPositions = data.reduce((acc: any, curr: any) => {
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
      {company && <QuestionsList positions={positions} company={company} />}
    </div>
  );
}
