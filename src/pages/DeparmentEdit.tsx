import DepartmentDialog from "@/components/companyDepartments/departmentDialog";
import DepartmentEmployees from "@/components/companyDepartments/DepartmentEmployees";
import { PositionDialog } from "@/components/PositionDialog";
import Spinner from "@/components/Spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/services/supabaseClient";
import { useUserStore } from "@/stores";
import { Frown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface Department {
  department_id: number;
  department_name: string;
  company_id: number;
  positions: {
    position_id: number;
    position_name: string;
    employees: number;
  }[];
  dashboard_visible: boolean;
  users: {
    user_id: string;
    first_name: string;
    last_name: string;
    department_id: number;
    avatar_url: string;
    position_id: number;
  }[];
}

export default function DepartmentEdit() {
  const user = useUserStore((state) => state.user);
  const [department, setDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchDepartmentInfo, setFetchDepartmentInfo] = useState<boolean>(true);
  //get department id from url

  const { state } = useLocation();
  const { targetId } = state || {};
  const { id } = useParams();

  const getDepartmentInfo = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, access_level, department_id, position_id, position:positions!position_id(position_name))"
      )
      .eq("department_id", id)
      .eq("company_id", user?.company_id)
      .single();

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    console.log({ data });
    setDepartment(data);
    setDepartmentName(data.department_name);
    setLoading(false);
    setFetchDepartmentInfo(false);
  };

  useEffect(() => {
    if (!user || !id) return;

    if (fetchDepartmentInfo) {
      console.log("getting department info");
      getDepartmentInfo();
    }
  }, [user, id, fetchDepartmentInfo]);

  useEffect(() => {
    if (!targetId || !department) return;
    const targetElement = document.getElementById(targetId);

    console.log({ targetElement });
    if (targetElement) {
      targetElement.scrollIntoView();
    }
  }, [targetId, department]);

  const handleChangeDepartmentName = async () => {
    if (!department || !user) return;
    if (!department.department_name) {
      toast.error("El nombre del departamento no puede estar vacío", {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("departments")
      .update({ department_name: departmentName.trim() })
      .eq("department_id", department.department_id)
      .eq("company_id", user?.company_id);
    if (error) {
      console.log(error.message);
      toast.error("Error al actualizar el nombre del departamento", {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }
    toast.success("Nombre del departamento actualizado correctamente", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setDepartmentName(departmentName.trim());
    setDepartment((prev) => {
      if (!prev) return null;
      return { ...prev, department_name: departmentName };
    });
  };

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
        <section className="">
          <div>
            <h2 className="font-bold text-lg">General</h2>
            <p className="text-sm font-light">
              Aquí puedes administrar ajustes generales del departamento
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex flex-row items-center mt-5 px-1">
                  <label className="w-2/6 ">Nombre del departamento: </label>
                  <Input
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-4/6 focus-visible:ring-primary"
                    value={departmentName}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    className="bg-neutral-600 hover:bg-neutral-700 text-white mt-5"
                    onClick={() => handleChangeDepartmentName()}
                    disabled={
                      !departmentName ||
                      loading ||
                      departmentName === department?.department_name
                    }
                  >
                    Guardar
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center mt-5 px-1 gap-3">
                  <div className="w-2/6 flex flex-col">
                    <label>Visible en el dashboard: </label>
                    <span className="text-xs text-neutral-500 italic font-light">
                      Elige si quieres que el departamento sea visible en el
                      dashboard con los mejores puntajes
                    </span>
                  </div>

                  <Switch
                    id="dashboard-visibility"
                    defaultChecked={department?.dashboard_visible}
                    onCheckedChange={async (e) => {
                      const { error } = await supabase
                        .from("departments")
                        .update({ dashboard_visible: e })
                        .eq("department_id", department?.department_id)
                        .eq("company_id", user?.company_id);

                      if (error) {
                        console.log(error.message);
                        toast.error(
                          "Error al actualizar la visibilidad del dashboard",
                          {
                            position: "bottom-right",
                            autoClose: 5000,
                          }
                        );
                      }

                      toast.success("Visibilidad del dashboard actualizada", {
                        position: "bottom-right",
                        autoClose: 2000,
                      });
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center mt-5 px-1">
                  <div className="w-2/6 flex flex-col">
                    <label>Eliminar departamento: </label>
                    <span className="text-xs text-neutral-500 italic font-light">
                      El departamento solo podrá ser eliminado si no tiene
                      empleados asignados
                    </span>
                  </div>

                  <DepartmentDialog
                    mode="delete"
                    departmentName={department?.department_name}
                    departmentId={department?.department_id}
                    company={{ id: user?.company_id }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
        </section>
        <section className="">
          <div>
            <h2 className="font-bold text-lg">Cargos</h2>
            <p className="text-sm font-light">
              Aquí puedes administrar los cargos del departamento
            </p>

            <div className="w-full flex justify-end">
              <PositionDialog
                departmentId={id}
                departmentName={department?.department_name}
                company={user?.company_id}
                setFetchDepartmentInfo={setFetchDepartmentInfo}
              />
            </div>
            <div className="max-h-[400px] h-full  overflow-y-auto">
              <ul className="gap-2 flex flex-col mt-4">
                {department && department?.positions.length > 0 ? (
                  department.positions.map((position) => (
                    <li
                      key={position.position_id}
                      className="flex lg:flex-row flex-col gap-3 py-4 items-center justify-between lg:p-2 border rounded-md border-neutral-200  "
                    >
                      <span>{position.position_name}</span>
                      <div className="flex flex-row items-center gap-3 ">
                        <div className="border border-neutral-200 rounded-md py-0.5 px-2">
                          <span className="text-sm text-neutral-500">
                            Empleados:{" "}
                            {
                              department.users.filter(
                                (user) =>
                                  user.position_id === position.position_id
                              ).length
                            }
                          </span>
                        </div>
                        <PositionDialog
                          mode="edit"
                          setFetchDepartmentInfo={setFetchDepartmentInfo}
                          positionName={position.position_name}
                          positionId={position.position_id}
                        />

                        <PositionDialog
                          mode="delete"
                          setFetchDepartmentInfo={setFetchDepartmentInfo}
                          positionName={position.position_name}
                          positionId={position.position_id}
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-neutral-500">
                    No hay cargos en este departamento
                  </li>
                )}
              </ul>
            </div>
          </div>

          <Separator className="my-4" />
        </section>

        <section id="employees">
          <div>
            <h2 className="font-bold text-lg">Empleados</h2>
            <p className="text-sm font-light">
              Aquí puedes ver quienes son los empleados del departamento
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4"></div>
          <DepartmentEmployees users={department?.users} />
        </section>
      </div>
    </div>
  );
}
