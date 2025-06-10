import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import SelectedDepartment from "./SelectedDepartment";
import { useCompanyStore } from "@/stores";

interface Department {
  id: number;
  name: string;
}

const CompanyDepartments = () => {
  const [departments, setDepartments] = useState<any>(null);
  const company = useCompanyStore((state) => state.company);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("company_id", company?.id);

    if (error) {
      console.log(error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setDepartments(data);
  };
  useEffect(() => {
    getDepartments();
  }, [company]);

  return (
    <div className="mx-auto  w-full">
      <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Departamentos
      </h2>
      <div className="flex flex-col lg:flex-row flex-wrap">
        {!isLoading && departments ? (
          departments.map((department: any) => {
            return (
              <div
                key={department.department_id}
                onClick={() =>
                  setSelectedDepartment({
                    id: department.department_id,
                    name: department.department_name,
                  })
                }
                className=" pl-3 mx-2 my-2 min-h-20 lg:w-1/6 border border-gray-200 hover:bg-gray-100  shadow-sm rounded-md flex flex-col justify-start py-2 cursor-pointer"
              >
                <h3 className="text-md font-semibold">
                  {department.department_name}
                </h3>
              </div>
            );
          })
        ) : (
          <p>Loading...</p>
        )}
        {!isLoading && (
          <div
            key={"new-dep"}
            className="relative pl-3 mx-2 my-2 min-h-20 lg:w-1/6 border border-gray-200 bg-darkText shadow-sm rounded-md flex flex-col justify-start py-2 hover:bg-darkText-darker cursor-pointer"
          >
            {" "}
            <h3 className="text- font-semibold text-white">
              {"Agregar departamento"}
            </h3>
            <FaPlus className="text-white absolute right-2" />
          </div>
        )}
      </div>
      <SelectedDepartment department={selectedDepartment} />
    </div>
  );
};
export default CompanyDepartments;
