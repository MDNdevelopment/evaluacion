import DepartmentsTable from "./companyDepartments/departmentsTable";
import { Separator } from "./ui/separator";
import DepartmentsInfo from "./companyDepartments/departmentsInfo";
import DepartmentsBest from "./companyDepartments/DepartmentsBest";
import useFetchDepartments from "@/hooks/useFetchDepartments";

const CompanyDepartments = () => {
  const {
    departments,
    departmentAvg,
    bestDepartment,
    companyTotals,
    company,
    refetch,
  } = useFetchDepartments();
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
      <div className="flex flex-col xl:flex-row gap-5 mb-5">
        <DepartmentsInfo companyTotals={companyTotals} />
        <DepartmentsBest bestDepartment={bestDepartment} />
      </div>

      <DepartmentsTable
        departmentAvg={departmentAvg}
        departments={departments}
        company={company}
        refetch={refetch}
      />
    </div>
  );
};
export default CompanyDepartments;
