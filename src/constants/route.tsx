import { Component } from "react";
import { Login, Dashboard } from "../pages/index";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthRoute, PrivateRoute } from "./routeHandler";
import NewEmployee from "../pages/NewEmployee";
import Team from "../pages/Team";
import Employee from "../pages/Employee";

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
    path: "*",
    element: <p>404 Error - No conseguí esa página 🤔</p>,
  },
];
