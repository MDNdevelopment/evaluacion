import { PositionDialog } from "../PositionDialog";
import { Separator } from "../ui/separator";

export default function DepartmentGeneralSettings({
  id,
  department,
  user,
  refetch,
}: {
  id?: string;
  department: any;
  user: any;
  refetch: () => void;
}) {
  return (
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
            refetch={refetch}
          />
        </div>
        <div className="max-h-[400px] h-full  overflow-y-auto">
          <ul className="gap-2 flex flex-col mt-4">
            {department && department?.positions.length > 0 ? (
              department.positions.map((position: any) => (
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
                            (user: any) =>
                              user.position_id === position.position_id
                          ).length
                        }
                      </span>
                    </div>
                    <PositionDialog
                      mode="edit"
                      refetch={refetch}
                      positionName={position.position_name}
                      positionId={position.position_id}
                    />

                    <PositionDialog
                      mode="delete"
                      refetch={refetch}
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
  );
}
