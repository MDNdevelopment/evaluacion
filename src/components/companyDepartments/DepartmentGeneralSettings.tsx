import { toast } from "react-toastify";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import DepartmentDialog from "./DepartmentDialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { supabase } from "@/services/supabaseClient";

export default function DepartmentGeneralSettings({
  departmentName,
  setDepartmentName,
  handleChangeDepartmentName,
  department,
  loading,
  user,
}: {
  departmentName: string;
  setDepartmentName: (name: string) => void;
  handleChangeDepartmentName: () => void;
  department: {
    department_id: number;
    department_name: string;
    dashboard_visible: boolean;
  } | null;
  loading: boolean;
  user: {
    company_id: string;
  } | null;
}) {
  return (
    <section className="">
      <div>
        <h2 className="font-bold text-lg">General</h2>
        <p className="text-sm font-light">
          Aquí puedes administrar ajustes generales del departamento
        </p>
        <div className="flex flex-col gap-3 ">
          <div className="">
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Nombre del departamento:{" "}
              </label>
              <Input
                onChange={(e) => setDepartmentName(e.target.value)}
                className="lg:w-4/6 w-1/2 focus-visible:ring-primary"
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
              <div className="flex flex-col lg:w-2/6 w-4/6 lg:text-base text-sm">
                <label className="">Visible en el dashboard: </label>
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
              <div className=" flex flex-col lg:w-2/6 w-4/6 lg:text-base text-sm">
                <label>Eliminar departamento: </label>
                <span className="text-xs text-neutral-500 italic font-light">
                  El departamento solo podrá ser eliminado si no tiene empleados
                  asignados
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
  );
}
