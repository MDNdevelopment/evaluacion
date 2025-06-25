import { Login, Dashboard } from "../pages/index";
import {
  AccessRoute,
  AdminRoute,
  AuthRoute,
  PrivateRoute,
} from "./routeHandler";
import NewEmployee from "../pages/NewEmployee";
// import Employee from "../pages/Employee"; // This page is not being used
import Settings from "../pages/Settings";
import PasswordReset from "../pages/PasswordReset";
import Summary from "../pages/Summary";
import Company from "@/pages/Company";
import PrototypeForm from "@/pages/PrototypeForm";
import EmployeeProfile from "@/pages/EmployeeProfile";
import CompanyEmployees from "@/components/CompanyEmployees";
import CompanyConfig from "@/components/CompanyConfig";
import CompanyDepartments from "@/components/CompanyDepartments";
import CompanyQuestions from "@/components/CompanyQuestions";
import CompanyDownload from "@/components/CompanyDownload";
import DepartmentEdit from "@/pages/DeparmentEdit";
export const Routes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AccessRoute access_level={2}>
          <Dashboard />
        </AccessRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <AccessRoute access_level={2}>
          <Dashboard />
        </AccessRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard/nuevo",
    element: (
      <PrivateRoute>
        <NewEmployee />
      </PrivateRoute>
    ),
  },
  {
    path: "/empleados",
    element: (
      <PrivateRoute>
        <AccessRoute access_level={2}>
          <PrototypeForm />
        </AccessRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/empleado/:id",
    element: (
      <PrivateRoute>
        <EmployeeProfile />
      </PrivateRoute>
    ),
  },
  {
    path: "/ajustes",
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    ),
  },
  {
    path: "/recuperacion",
    element: (
      <AuthRoute>
        <PasswordReset />
      </AuthRoute>
    ),
  },
  {
    path: "/resumen",
    element: (
      <PrivateRoute>
        <AccessRoute access_level={2}>
          <Summary />
        </AccessRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion",
    element: (
      <PrivateRoute>
        <Company />
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/empleados",
    element: (
      <PrivateRoute>
        <AdminRoute>
          <CompanyEmployees />
        </AdminRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/configuracion",
    element: (
      <PrivateRoute>
        <AdminRoute>
          <CompanyConfig />
        </AdminRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/departamentos",
    element: (
      <PrivateRoute>
        <AdminRoute>
          <CompanyDepartments />
        </AdminRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/departamentos/:id",
    element: (
      <PrivateRoute>
        <AdminRoute>
          <DepartmentEdit />
        </AdminRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/preguntas",
    element: (
      <PrivateRoute>
        <AdminRoute>
          <CompanyQuestions />
        </AdminRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/organizacion/descargas",
    element: (
      <PrivateRoute>
        <CompanyDownload />
      </PrivateRoute>
    ),
  },
  {
    path: "*",
    element: <p>404 Error - No conseguí esa página 🤔</p>,
  },
];
