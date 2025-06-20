import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/stores";
import DepartmentsTable from "./companyDepartments/departmentsTable";
import { Separator } from "./ui/separator";
import DepartmentsInfo from "./companyDepartments/departmentsInfo";
import DepartmentsBest from "./companyDepartments/DepartmentsBest";

interface CompanyInfo {
  departments: number;
  positions: number;
  employees: number;
}

const CompanyDepartments = () => {
  const [departments, setDepartments] = useState<any>([]);
  const company = useCompanyStore((state) => state.company);
  const [departmentAvg, setDepartmentAvg] = useState<any>({});
  const [bestDepartment, setBestDepartment] = useState<any>(undefined);
  const [companyInfo, setCompanyInfo] = useState<
    CompanyInfo | null | undefined
  >(undefined);

  const getDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, department_id,  evaluations:evaluation_sessions!employee_id(period, total_score.avg())) "
      )
      .eq("company_id", company?.id);

    if (error) {
      console.log(error.message);
      setDepartments([]);
      setCompanyInfo(null);
      setBestDepartment(null);
      setDepartmentAvg({});
      return;
    }

    console.log({ data });

    //Calculate average score for each user > department
    const departmentAvgScore = data.reduce((acc: any, department: any) => {
      if (!acc[department.department_id]) {
        acc[department.department_id] = {
          id: department.department_id,
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
    setCompanyInfo(totals);
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

    console.log({ bestDept });
    setBestDepartment({
      id: bestDept.id,
      name:
        departments.find((dept: any) => dept.department_id === bestDept.id)
          ?.department_name || "N/A",
      avg_score: bestDept.avg_score,
      user_count: bestDept.user_count,
    });
  };

  useEffect(() => {
    getDepartments();
  }, [company]);

  return (
    <div className=" w-full max-w-[1200px] mx-auto  px-4 py-8">
      <p className="text-neutral-700 font-base italic">
        Gestiona los departamentos de tu organización
      </p>
      <p className="text-neutral-600 font-light text-sm">
        Aquí podrás agregar/modificar/eliminar departamentos y sus cargos,
        además de ver su lista de empleados.
      </p>
      <Separator className="my-3 mb-5" />
      <div className="flex flex-row gap-5 mb-5">
        <DepartmentsInfo companyInfo={companyInfo} />
        <DepartmentsBest bestDepartment={bestDepartment} />
      </div>

      <DepartmentsTable
        departmentAvg={departmentAvg}
        departments={departments}
      />
    </div>
  );
};
export default CompanyDepartments;
