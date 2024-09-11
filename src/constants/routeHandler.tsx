interface Props {
  children?: React.ReactNode;
}

import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

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

export const PrivateRoute = ({ children }: Props) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};
