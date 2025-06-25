import DepartmentEmployees from "./DepartmentEmployees";

export default function DepartmentEmployeesSettings({
  department,
}: {
  department: any;
}) {
  return (
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
  );
}
