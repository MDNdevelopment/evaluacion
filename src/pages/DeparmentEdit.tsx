import { DeletePosition } from "@/components/DeletePosition";
import { PositionDialog } from "@/components/PositionDialog";
import { QuestionDialog } from "@/components/QuestionDialog";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/services/supabaseClient";
import { useUserStore } from "@/stores";
import { Frown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Department {
  department_id: number;
  department_name: string;
  company_id: number;
  positions: {
    position_id: number;
    position_name: string;
    employees: number;
  }[];
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
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchDepartmentInfo, setFetchDepartmentInfo] = useState<boolean>(true);
  //get department id from url

  const { id } = useParams();

  const getDepartmentInfo = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, department_id, position_id)"
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
      <p className="text-neutral-600 text-xl">
        Gestiona el departamento de {department?.department_name}
      </p>
      <Separator className="my-4" />
      <div className="flex flex-col gap-5 lg:w-2/4 overflow-y-auto">
        <section className="">
          <div>
            <h2 className="font-medium">Cargos</h2>
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

                        {/* <DeletePosition
                          positionName={position.position_name}
                          positionId={position.position_id}
                          setLoading={setLoading}
                        /> */}
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

        <section className="">
          <div>
            <h2 className="font-medium">Foto de perfil</h2>
            <p className="text-sm font-light">
              Aquí puedes cambiar tu foto de perfil
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4"></div>
        </section>
      </div>
    </div>
  );
}
