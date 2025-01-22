interface Props {
  children?: React.ReactNode;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSessionStore } from "@/stores/useSessionStore";
import { useUserStore } from "@/stores/useUserStore";

//Function to check if the user is authenticated
const isAuthenticated = () => {
  const session = useSessionStore.getState().session;
  if (session) {
    return true;
  }
  return false;
};

const checkPermissions = (access_level: number | null) => {
  if (access_level === 1) return false;
  if (access_level === null) return false;
  return true;
};

export const AuthRoute = ({ children }: Props) => {
  const loc = useLocation();
  const location = window.location;

  // If we're on the password reset page, allow access even if not authenticated
  const isPasswordResetRoute =
    location.pathname === "/recuperacion" && location.search.includes("token");

  // Allow access if it's a password reset route with a token
  if (isPasswordResetRoute) {
    return children;
  }

  // Otherwise, if authenticated, redirect to dashboard
  if (isAuthenticated()) {
    console.log({ path: loc.pathname });
    return <Navigate to={loc.pathname} replace />;
  }

  // If not authenticated, render the children
  return children;
};

export const PrivateRoute = ({ children }: Props) => {
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const session = useSessionStore((state) => state.session);
  const isSettingsPage = location.pathname === "/perfil";

  if (session === undefined) {
    return <p>Loading...</p>;
  }
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
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
  if (user) {
    if (!checkPermissions(user.access_level)) {
      return (
        <>
          <Navbar />
          <Navigate to={`/empleado/${user.id}`} />
          <Outlet />
          {children}
        </>
      );
    }
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
