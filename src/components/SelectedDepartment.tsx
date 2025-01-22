import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";

export default function SelectedDepartment({ department }: any) {
  const [employeesQuantity, setEmployeesQuantity] = useState<Number | null>(
    null
  );
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

    console.log(employeesQuantity);
    setEmployeesQuantity(0);
  };

  useEffect(() => {
    setEmployeesQuantity(null);
    if (department) {
      getDepartmentEmployees();
    }
  }, [department]);

  if (department)
    return (
      <div className="mt-12">
        <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
          {department.name}
        </h3>

        {/* <div>
          <p className="text-sm text-gray-500">
            Total empleados:{" "}
            {employeesQuantity === null ? (
              <span>Cargando...</span>
            ) : (
              <span>{employeesQuantity}</span>
            )}
          </p>

          <h3 className="mt-10 scroll-m-20 text-xl font-semibold tracking-tight">
            Preguntas
          </h3>
        </div> */}
      </div>
    );
}
