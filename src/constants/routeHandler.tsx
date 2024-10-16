import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTokenStore } from "../stores/useTokenStore";
import { useUserStore } from "../stores/useUserStore";

interface Props {
  children?: React.ReactNode;
}

//Function to check if the user is authenticated

export const AuthRoute = ({ children }: Props) => {
  const token = useTokenStore((state) => state.token);
  const location = window.location;

  // If we're on the password reset page, allow access even if not authenticated
  const isPasswordResetRoute =
    location.pathname === "/recuperacion" && location.search.includes("token");

  // Allow access if it's a password reset route with a token
  if (isPasswordResetRoute) {
    return children;
  }

  // Otherwise, if authenticated, redirect to dashboard
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export const PrivateRoute = ({ children }: Props) => {
  const location = useLocation();
  const isSettingsPage = location.pathname === "/perfil";
  const user = useUserStore((state) => state.user);
  const token = useTokenStore((state) => state.token);

  // If the user is not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user === null) {
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
  if (user && user.privileges === 1) {
    return (
      <>
        <Navbar />
        <Navigate to={`/empleado/${user.id}`} />
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
