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

const checkPermissions = (privileges) => {
  if (privileges === 1) return false;
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
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(localStorage.getItem("user-storage")).state.user;
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
