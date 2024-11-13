import { Login, Dashboard } from "../pages/index";
import { AuthRoute, PrivateRoute } from "./routeHandler";
import NewEmployee from "../pages/NewEmployee";
import Team from "../pages/Team";
import Employee from "../pages/Employee";
import Profile from "../pages/Profile";
import PasswordReset from "../pages/PasswordReset";
import Summary from "../pages/Summary";

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
        <Dashboard />
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
        <Team />
      </PrivateRoute>
    ),
  },
  {
    path: "/empleado/:id",
    element: (
      <PrivateRoute>
        <Employee />
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
      // <AuthRoute>
      <PasswordReset />
      // </AuthRoute>
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
    path: "*",
    element: <p>404 Error - No conseguí esa página 🤔</p>,
  },
];
