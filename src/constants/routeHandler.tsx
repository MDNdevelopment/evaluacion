interface Props {
  children?: React.ReactNode;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";

//Function to get the access token from cookies
const getAccessToken = () => {
  return Cookies.get("auth-token");
};

//Function to check if the user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
};

const checkPermissions = (privileges: number | null) => {
  if (privileges === 1) return false;
  if (privileges === null) return false;
  return true;
};

export const AuthRoute = ({ children }: Props) => {
  const location = window.location;

  // If we're on the password reset page, allow access even if not authenticated
  const isPasswordResetRoute =
    location.pathname === "/recuperacion" && location.search.includes("token");

  // Allow access if it's a password reset route with a token
  if (isPasswordResetRoute) {
    return children;
  }

  // Otherwise, if authenticated, redirect to dashboard
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

export const PrivateRoute = ({ children }: Props) => {
  const location = useLocation();
  const isSettingsPage = location.pathname === "/perfil";
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userItem = localStorage.getItem("user-storage");
  if (userItem === null) {
    Cookies.remove("auth-token");
    <Navigate to={`/login`} />;
    return;
  }
  const userData = JSON.parse(userItem).state.user;
  if (isSettingsPage) {
    return (
      <>
        <Navbar />
        <Outlet />
        {children}
      </>
    );
  }
  if (!checkPermissions(userData.privileges)) {
    return (
      <>
        <Navbar />
        <Navigate to={`/empleado/${userData.id}`} />
        <Outlet />
        {children}
      </>
    );
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
