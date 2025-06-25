import DepartmentGeneralSettings from "@/components/companyDepartments/DepartmentGeneralSettings";
import Spinner from "@/components/Spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useDepartment from "@/hooks/useDepartment";
import { Frown } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import DepartmentPositionsSettings from "@/components/companyDepartments/DepartmentPositionsSettings";
import DepartmentEmployeesSettings from "@/components/companyDepartments/DepartmentEmployeesSettings";

export default function DepartmentEdit() {
  //get department id from url

  const { state } = useLocation();
  const { targetId } = state || {};
  const { id } = useParams();

  const {
    loading,
    department,
    user,
    refetch,
    departmentName,
    setDepartmentName,
    handleChangeDepartmentName,
  } = useDepartment(id);

  useEffect(() => {
    if (!targetId || !department) return;
    const targetElement = document.getElementById(targetId);

    console.log({ targetElement });
    if (targetElement) {
      targetElement.scrollIntoView();
    }
  }, [targetId, department]);

  if (!user) {
    return (
      <>
        <h1>Cargando...</h1>
      </>
    );
  }

  if (loading && !department) {
    return (
      <div className="flex items-center justify-center pt-10">
        <Spinner />
      </div>
    );
  }

  if (!loading && !department) {
    return (
      <div className="justify-center items-center flex flex-col gap-5 h-full">
        <div className="flex items-center justify-center  gap-3">
          <Frown className="text-neutral-600" />
          <span className="text-2xl font-bold text-neutral-600">
            No se encontró el departamento
          </span>
        </div>
        <div>
          <Link to={"/organizacion/departamentos"}>
            <Button variant="outline" className="w-full">
              Volver a departamentos
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="  p-10 ">
      <div className="my-2">
        {" "}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/organizacion/departamentos">Departamentos</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to={`/organizacion/departamentos/${id}`}>
                {department?.department_name}
              </Link>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <p className="text-neutral-800 text-xl">
        Gestiona el departamento de {department?.department_name}
      </p>

      <Separator className="my-4" />

      <div className="flex flex-col gap-5 w-full xl:w-2/4 overflow-y-auto">
        <DepartmentGeneralSettings
          departmentName={departmentName}
          setDepartmentName={setDepartmentName}
          department={department}
          handleChangeDepartmentName={handleChangeDepartmentName}
          loading={loading}
          user={user}
        />

        <DepartmentPositionsSettings
          user={user}
          department={department}
          refetch={refetch}
          id={id}
        />

        <DepartmentEmployeesSettings department={department} />
      </div>
    </div>
  );
}
