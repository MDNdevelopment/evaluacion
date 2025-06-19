import { supabase } from "@/services/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import SelectedDepartment from "./SelectedDepartment";
import { useCompanyStore } from "@/stores";
import DepartmentsTable from "./companyDepartments/departmentsTable";
import { Separator } from "./ui/separator";
import Spinner from "./Spinner";

interface Department {
  id: number;
  name: string;
}

const testDepartments = [
  {
    department_id: 0,
    department_name: "IT",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [
      { position_id: 37, position_name: "Programador" },
      { position_id: 39, position_name: "Coord. Tecnología" },
    ],
    users: [
      {
        user_id: "c4c5f406-dafc-4a0b-b0f7-860306953ca1",
        last_name: "Pirela",
        avatar_url:
          "https://res.cloudinary.com/mdnclientes/image/upload/v1750168249/evaluacion/c4c5f406-dafc-4a0b-b0f7-860306953ca1.jpg",
        first_name: "Ovidio",
        evaluations: [
          { avg: 4.3, period: "2025-05-01" },
          { avg: 3.47916665673256, period: "2025-03-01" },
          { avg: 3.75, period: "2025-04-01" },
        ],
        department_id: 0,
      },
      {
        user_id: "2d50a4e5-35db-4be5-b27a-a24d1282ce82",
        last_name: "Lauretta",
        avatar_url:
          "https://res.cloudinary.com/mdnclientes/image/upload/v1749824390/evaluacion/2d50a4e5-35db-4be5-b27a-a24d1282ce82.jpg",
        first_name: "Juan",
        evaluations: [
          { avg: 4.33333333333333, period: "2025-05-01" },
          { avg: 3.53571428571429, period: "2025-03-01" },
          { avg: 4, period: "2025-04-01" },
        ],
        department_id: 0,
      },
    ],
  },
  {
    department_id: 1,
    department_name: "Redes",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [
      { position_id: 6, position_name: "Social Media Manager" },
      { position_id: 7, position_name: "Community Manager" },
    ],
    users: [
      {
        user_id: "9cc10d49-7517-482a-91dd-df1de418b6ba",
        last_name: "Portillo",
        avatar_url: null,
        first_name: "Georgina",
        evaluations: [
          { avg: 4.6, period: "2025-05-01" },
          { avg: 3.9, period: "2025-03-01" },
          { avg: 4.0, period: "2025-04-01" },
        ],
        department_id: 1,
      },
    ],
  },
  {
    department_id: 2,
    department_name: "Audiovisual",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 10, position_name: "Editor" }],
    users: [],
  },
  {
    department_id: 3,
    department_name: "Diseño",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 11, position_name: "Diseñador" }],
    users: [],
  },
  {
    department_id: 4,
    department_name: "Operaciones",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 12, position_name: "Operador" }],
    users: [],
  },
  {
    department_id: 5,
    department_name: "Administración",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 13, position_name: "Administrador" }],
    users: [],
  },
  {
    department_id: 6,
    department_name: "Dirección",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 14, position_name: "Director" }],
    users: [],
  },
  {
    department_id: 7,
    department_name: "Sub Dirección",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 15, position_name: "Subdirector" }],
    users: [],
  },
  {
    department_id: 8,
    department_name: "Desarrollo Laboral",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 16, position_name: "Desarrollador" }],
    users: [],
  },
  {
    department_id: 9,
    department_name: "Recursos Humanos",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 17, position_name: "RRHH" }],
    users: [],
  },
  {
    department_id: 10,
    department_name: "Legal",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 18, position_name: "Abogado" }],
    users: [],
  },
  {
    department_id: 11,
    department_name: "Ventas",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 19, position_name: "Vendedor" }],
    users: [],
  },
  {
    department_id: 12,
    department_name: "Compras",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 20, position_name: "Comprador" }],
    users: [],
  },
  {
    department_id: 13,
    department_name: "Logística",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 21, position_name: "Logístico" }],
    users: [],
  },
  {
    department_id: 14,
    department_name: "Calidad",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 22, position_name: "Inspector" }],
    users: [],
  },
  {
    department_id: 15,
    department_name: "Atención al Cliente",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 23, position_name: "Atención" }],
    users: [],
  },
  {
    department_id: 16,
    department_name: "Innovación",
    company_id: "660f3088-9f6a-4566-9b22-11cd856631e4",
    positions: [{ position_id: 24, position_name: "Innovador" }],
    users: [],
  },
];

const CompanyDepartments = () => {
  const [departments, setDepartments] = useState<any>(null);
  const company = useCompanyStore((state) => state.company);
  const [departmentAvg, setDepartmentAvg] = useState<any>(null);
  const [bestDepartment, setBestDepartment] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const getDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, department_id,  evaluations:evaluation_sessions!employee_id(period, total_score.avg())) "
      )
      .eq("company_id", company?.id);

    if (error) {
      console.log(error.message);
      setIsLoading(false);
      return;
    }

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

    setIsLoading(false);
    setDepartments(data);
    setDepartments(testDepartments);

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

  const testData = [
    {
      title: "Departamentos",
      value: 17,
    },
    {
      title: "Cargos",
      value: 15,
    },
    {
      title: "Empleados",
      value: 55,
    },
  ];

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
        <div className="h-64 w-full flex flex-col border  border-neutral-200 rounded-md ">
          <div className="flex-none h-1/3 flex flex-row p-1 px-5 gap-5">
            {testData.map((item, index) => (
              <>
                <div className="flex flex-col justify-center  flex-1 ">
                  <span className="text-base font-light">{item.title}:</span>
                  <span className="font-black text-4xl text-neutral-700 self-end pr-5">
                    {item.value}
                  </span>
                </div>
                {index < testData.length - 1 && (
                  <Separator orientation="vertical" className="h-3/5 my-auto" />
                )}
              </>
            ))}
          </div>
          <Separator className=" w-4/5 mx-auto" />
          <div className="flex-1 flex-col flex px-5 py-1 gap-3 . pb-5">
            <div className="flex flex-col">
              {" "}
              <span className="text-base font-light">Mejor departamento:</span>
              <span className="italic text-neutral-400 text-xs">
                Basado en promedio y cantidad de empleados
              </span>
            </div>

            <div className="bg-neutral-50 w-full h-full border rounded-md shadow-sm flex justify-center items-center">
              {bestDepartment ? (
                <div className="flex flex-row w-full items-center h-full px-10 py-2 ">
                  <span className="font-black uppercase text-2xl text-neutral-700 flex-1">
                    Diseño
                  </span>
                  <div className="flex-1 flex flex-row  justify-between">
                    <div className="flex flex-col justify-center items-center   ">
                      <span className="text-base font-light">Empleados:</span>
                      <span className="font-black text-4xl text-neutral-700 self-end pr-5">
                        {bestDepartment.user_count}
                      </span>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="h-3/5 my-auto"
                    />
                    <div className="flex flex-col justify-center items-center  ">
                      <span className="text-base font-light">Promedio:</span>
                      <span className="font-black text-4xl text-neutral-700 self-end pr-5">
                        {bestDepartment.avg_score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Spinner />
              )}
            </div>
          </div>
        </div>
        <div className="h-64 w-full border border-neutral-200 rounded-md"></div>
      </div>
      {departments && (
        <DepartmentsTable
          departmentAvg={departmentAvg}
          departments={departments}
        />
      )}
    </div>
  );
};
export default CompanyDepartments;
