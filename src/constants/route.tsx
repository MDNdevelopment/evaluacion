import { Login, Dashboard } from "../pages/index";
import { AccessRoute, AuthRoute, PrivateRoute } from "./routeHandler";
import NewEmployee from "../pages/NewEmployee";
// import Employee from "../pages/Employee"; // This page is not being used
import Profile from "../pages/Profile";
import PasswordReset from "../pages/PasswordReset";
import Summary from "../pages/Summary";
import Company from "@/pages/Company";
import PrototypeForm from "@/pages/PrototypeForm";
import EmployeeProfile from "@/pages/EmployeeProfile";

export const Routes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Dashboard />
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
        <PrototypeForm />
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
    path: "/perfil",
    element: (
      <PrivateRoute>
        <Profile />
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
        <Summary />
      </PrivateRoute>
    ),
  },
  {
    path: "/company",
    element: (
      <PrivateRoute>
        <Company />
      </PrivateRoute>
    ),
  },

  {
    path: "*",
    element: <p>404 Error - No conseguí esa página 🤔</p>,
  },
];
