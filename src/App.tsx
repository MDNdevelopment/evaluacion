import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Button from "@mui/material/Button";
import { RouterProvider } from "react-router-dom";
import { router } from "./constants/router";
import AppTheme from "./shared-theme/AppTheme";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AppTheme>
      <RouterProvider router={router} />
    </AppTheme>
  );
}

export default App;
