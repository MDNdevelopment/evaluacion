import { useState } from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./constants/router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
