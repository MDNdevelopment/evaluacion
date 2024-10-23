import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./constants/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useTokenStore } from "./stores/useTokenStore";
import { useUserStore } from "./stores/useUserStore";

function App() {
  const [loading, setLoading] = useState(true);
  const setToken = useTokenStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    console.log("refreshing token");
    // Make an explicit call to refresh the access token
    axios
      .post(
        process.env.NODE_ENV === "production"
          ? "https://mdn-evaluacion.onrender.com/refresh-token"
          : "http://localhost:5500/refresh-token",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        console.log("im here");
        setToken(response.data.accessToken); // Update the access token in Zustand store
        setUser(response.data.userData); // Update the user data in Zustand store
        setLoading(false); // Stop loading spinner
      })
      .catch((error) => {
        console.error("Error refreshing token:", error);
        setLoading(false);
      });
  }, [setToken, setUser]);

  if (loading) {
    return <div>Loading...</div>; // Show spinner while refreshing token
  }
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
