import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Routes } from "./route";

export const router = createBrowserRouter(
  createRoutesFromElements(
    Routes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element} />
    ))
  )
);
