import { Link } from "react-router-dom";
import TopRated from "../components/TopRated";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
export default function Dashboard() {
  return (
    <div className="p-10  ">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/dashboard">Inicio</Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-[1200px] mx-auto">
        <TopRated />
      </div>
    </div>
  );
}
