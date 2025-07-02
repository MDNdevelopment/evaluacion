import { supabase } from "@/services/supabaseClient";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useEffect, useState, useCallback } from "react";

export default function useDepartmentsWithPositions() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const company = useCompanyStore((state) => state.company);
  const [departments, setDepartments] = useState<any[] | null>(null);
  const [positions, setPositions] = useState<any>(null);

  const getCompanyData = useCallback(async () => {
    if (company) {
      const { data: departmentsData, error } = await supabase
        .from("departments")
        .select("department_id, department_name")
        .eq("company_id", company.id);

      if (error) {
        console.log(error.message);
        return;
      }

      if (departmentsData) {
        setDepartments(departmentsData);
      }

      const { data: positionsData, error: errorPositions } = await supabase
        .from("positions")
        .select("position_id, position_name, department_id")
        .eq("company_id", company.id);

      if (errorPositions) {
        console.log(errorPositions.message);
        return;
      }

      //positions grouped by department id
      const groupedPositions = positionsData.reduce(
        (acc: { [key: number]: any[] }, position) => {
          if (!acc[position.department_id]) {
            acc[position.department_id] = [];
          }
          acc[position.department_id].push(position);
          return acc;
        },
        {}
      );

      setPositions(groupedPositions);
    }
  }, [company]);

  useEffect(() => {
    getCompanyData();
  }, [getCompanyData]);

  return {
    isLoading,
    setIsLoading,
    company,
    departments,
    positions,
  };
}
