interface Props {
  children?: React.ReactNode;
}

import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";

//Function to get the access token from cookies
const getAccessToken = () => {
  console.log(Cookies.get("auth-token"));

  return Cookies.get("auth-token");
};

//Function to check if the user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
};

export const AuthRoute = ({ children }: Props) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

// export const PrivateRoute = ({ children }: Props) => {
//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

export const PrivateRoute = ({ children }: Props) => {
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the Navbar and the protected content
  return (
    <>
      <Navbar /> {/* Render Navbar only in protected routes */}
      <Outlet /> {/* This renders the protected route content */}
      {children} {/* Render children if provided */}
    </>
  );
};
