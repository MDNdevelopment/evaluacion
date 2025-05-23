import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";
import DepartmentQuestions from "./DepartmentQuestions";
import { useCompanyStore } from "@/stores";
import { PositionDialog } from "./PositionDialog";
import { DeletePosition } from "./DeletePosition";

interface Position {
  position_name: string;
  position_id: number;
}

export default function SelectedDepartment({
  department,
  setSelectedDepartment,
}: any) {
  const [employeesQuantity, setEmployeesQuantity] = useState<Number | null>(
    null
  );
  const company = useCompanyStore((state) => state.company);

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const getPositions = async () => {
    console.log("getting positions");
    if (company) {
      const { data, error } = await supabase
        .from("positions")
        .select("position_name, position_id")
        .eq("company_id", company.id)
        .eq("department_id", department.id);

      if (error) {
        console.log(error.message);
        return;
      }

      console.log(data);

      setPositions(data);
      console.log({ newPositions: data });
      setSelectedPosition(data[0]);
    }
  };

  const getDepartmentEmployees = async () => {
    console.log("getting data");
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("department_id", department.id);

    if (error) {
      console.log(error.message);
    }

    if (count) {
      setEmployeesQuantity(count);
      return;
    }

    setEmployeesQuantity(0);
  };

  useEffect(() => {
    setEmployeesQuantity(null);
    setPositions([]);
    if (department) {
      getDepartmentEmployees();
      getPositions();
      setIsLoading(false);
    }
  }, [department, isLoading]);

  if (department)
    return (
      <div className="mt-12">
        <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
          Departamento: <span className="font-normal">{department.name}</span>
        </h3>

        <div>
          <p className="text-sm text-gray-500">
            Total empleados:{" "}
            {employeesQuantity === null ? (
              <span>Cargando...</span>
            ) : (
              <span>{JSON.stringify(employeesQuantity)}</span>
            )}
          </p>

          <PositionDialog
            departmentName={department.name}
            departmentId={department.id}
            company={company}
            setIsLoading={setIsLoading}
          />

          <h3 className="mt-10 scroll-m-20 text-xl font-semibold tracking-tight">
            Cargos
          </h3>
        </div>
        <div className="flex flex-row flex-wrap w-5/6 mt-3  items-start">
          {positions && positions.length > 0 ? (
            positions.map((position) => {
              return (
                <div
                  key={position.position_name}
                  onClick={() => setSelectedPosition(position)}
                  className={`py-1 px-2 border w-fit rounded-lg  cursor-pointer  mx-1 text-darkText text-sm font-normal ${
                    position.position_id === selectedPosition?.position_id
                      ? "bg-darkText hover:bg-darkText-darker text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <h4>{position.position_name}</h4>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">No se encontraron cargos...</p>
          )}
        </div>

        {selectedPosition && !isLoading && (
          <>
            <DepartmentQuestions
              departmentName={department.name}
              departmentId={department.id}
              position={selectedPosition}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            <DeletePosition
              company={company}
              positionName={selectedPosition?.position_name}
              positionId={selectedPosition?.position_id}
              setIsLoading={setIsLoading}
              setSelectedDepartment={setSelectedDepartment}
              department={department}
            />
          </>
        )}
      </div>
    );
}
