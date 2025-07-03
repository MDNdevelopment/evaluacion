import { useEffect } from "react";

export default function JobData({
  register,
  setValue,
  departments,
  positions,
  selectedDepartment,
  setSelectedDepartment,
}: any) {
  useEffect(() => {
    if (!selectedDepartment || !positions) {
      console.log({ selectedDepartment, positions });
      return;
    }
    console.log("setting position");
    setValue("position", positions[selectedDepartment][0].position_id);
  }, [selectedDepartment, positions]);

  useEffect(() => {
    if (!departments) return;
    setValue("department", departments[0].department_id);
    setSelectedDepartment(departments[0].department_id);
  }, [departments]);
  return (
    <div className="w-full">
      <h2 className="font-bold text-lg mt-10">Datos laborales</h2>

      <div className="flex flex-col gap-3 ">
        <div className="">
          <div className="flex flex-row items-center mt-5 px-1">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
              Departamento:{" "}
            </label>
            <select
              id="department"
              {...register("department")}
              className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
              onChange={(e) => {
                setSelectedDepartment(parseInt(e.target.value));
              }}
            >
              {departments &&
                departments.map((department: any) => (
                  <option
                    key={department.department_name}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-row items-center mt-5 px-1">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
              Cargo:{" "}
            </label>
            <select
              id="position"
              {...register("position")}
              className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
            >
              {positions &&
                selectedDepartment !== null &&
                positions[selectedDepartment].map((position: any) => {
                  return (
                    <option
                      key={position.position_name}
                      value={position.position_id}
                    >
                      {position.position_name}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="flex flex-row items-center mt-5 px-1">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
              Nivel de acceso:{" "}
            </label>
            <select
              id="access_level"
              {...register("access_level")}
              className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
            >
              <option value={1}>1</option>
              <option value={2}>2 </option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <div className="flex flex-row items-center mt-5 px-1">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">Rol: </label>
            <select
              id="admin"
              {...(register("admin"), { defaultValue: "false" })}
              className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
            >
              <option value="true">Admin</option>
              <option value="false">Empleado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
