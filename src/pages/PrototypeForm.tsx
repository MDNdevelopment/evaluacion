import { EmployeesTable } from "@/components/EmployeesEvaluationsTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function PrototypeForm() {
  return (
    <div className="p-10 shadow-md">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/">Inicio</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/components">Evaluar</Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EmployeesTable />
    </div>
  );
}
