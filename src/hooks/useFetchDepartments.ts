import { supabase } from "@/services/supabaseClient";
import { useCompanyStore } from "@/stores";
import { useCallback, useEffect, useState } from "react";

interface CompanyTotals {
  departments: number;
  positions: number;
  employees: number;
}

export default function useFetchDepartments() {
  const [departments, setDepartments] = useState<any>([]);
  const company = useCompanyStore((state) => state.company);
  const [departmentAvg, setDepartmentAvg] = useState<any>({});
  const [bestDepartment, setBestDepartment] = useState<any>(undefined);
  const [companyTotals, setCompanyTotals] = useState<
    CompanyTotals | null | undefined
  >(undefined);
  useState<boolean>(false);

  const getDepartments = useCallback(async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, department_id,  evaluations:evaluation_sessions!employee_id(period, total_score.avg())) "
      )
      .eq("company_id", company?.id);

    if (error) {
      console.log(error.message);
      setDepartments([]);
      setCompanyTotals(null);
      setBestDepartment(null);
      setDepartmentAvg({});
      return;
    }

    //Calculate average score for each user > department
    const departmentAvgScore = data.reduce((acc: any, department: any) => {
      if (!acc[department.department_id]) {
        acc[department.department_id] = {
          id: department.department_id,
          name: department.department_name,
          total_score: 0,
          user_count: 0,
          avg_score: 0,
        };
      }

      let dept = acc[department.department_id];

      department.users.forEach((user: any) => {
        if (user.evaluations.length === 0) return;
        const totalScore = user.evaluations.reduce(
          (sum: number, evaluation: any) => {
            return sum + (evaluation.avg || 0);
          },
          0
        );

        let userTotal = totalScore / user.evaluations.length;
        dept.total_score += userTotal;
        dept.user_count += 1;
      });
      dept.avg_score = dept.total_score / dept.user_count;
      return acc;
    }, {});

    setDepartmentAvg(departmentAvgScore);

    const totals = data.reduce(
      (acc: any, department: any) => {
        acc.departments += 1;
        acc.positions += department.positions.length;
        acc.employees += department.users.length;
        return acc;
      },
      {
        departments: 0,
        positions: 0,
        employees: 0,
      }
    );
    setCompanyTotals(totals);
    setDepartments(data);

    // Find the department with the highest average score
    const bestDept: any = Object.values(departmentAvgScore).reduce(
      (best: any, current: any) => {
        // Use log to give more weight to larger departments, but not too much
        const currentWeighted =
          (current.avg_score || 0) * Math.log((current.user_count || 0) + 1);
        const bestWeighted =
          (best.avg_score || 0) * Math.log((best.user_count || 0) + 1);
        return currentWeighted > bestWeighted ? current : best;
      }
    );

    setBestDepartment({
      id: bestDept.id,
      name: bestDept.name || "no hay",
      avg_score: bestDept.avg_score,
      user_count: bestDept.user_count,
    });
  }, []);

  useEffect(() => {
    getDepartments();
  }, [company, getDepartments]);

  return {
    departments,
    departmentAvg,
    bestDepartment,
    companyTotals,
    company,
    refetch: getDepartments,
  };
}
