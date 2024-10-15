import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import { checkPrivileges } from "../utils/checkPrivileges";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface Props {
  children?: React.ReactNode;
}

interface Token {
  id: string | null;
}
//Function to get the access token from cookies
const getAccessToken = () => {
  const token = Cookies.get("auth-token");
  console.log(token);
  //get the user privileges from the token

  return token;
};

const decodeJWT = () => {
  const token = getAccessToken();
  const decodedToken = token ? jwtDecode(token) : null;
  return decodedToken;
};

//Function to check if the user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
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
  const token = decodeJWT();
  const userId: Token = token?.id;
  let userPrivileges = null;

  const location = useLocation();
  const isSettingsPage = location.pathname === "/perfil";

  useEffect(() => {
    const fetchPrivileges = async () => {
      userPrivileges = await checkPrivileges();
    };
    fetchPrivileges();
  }, []);

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userItem = Cookies.get("auth-token");
  if (userItem === null) {
    Cookies.remove("auth-token");
    <Navigate to={`/login`} />;
    return;
  }
  if (isSettingsPage) {
    return (
      <>
        <Navbar />
        <Outlet />
        {children}
      </>
    );
  }
  console.log({ userPrivileges });
  if (userPrivileges === 1) {
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
