interface Props {
  children?: React.ReactNode;
  access_level?: number;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/stores/useSessionStore";
import { useUserStore } from "@/stores/useUserStore";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import PageHeader from "@/components/Navigation/page-header";

//Function to check if the user is authenticated
const isAuthenticated = () => {
  const session = useSessionStore.getState().session;
  if (session) {
    return true;
  }
  return false;
};

// const checkPermissions = (access_level: number | null) => {
//   if (access_level === 1) return false;
//   if (access_level === null) return false;
//   return true;
// };

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

export const AccessRoute = ({ children, access_level = 1 }: Props) => {
  const user = useUserStore((state) => state.user);

  console.log({ user });

  if (!user) {
    return <>Cargando...</>;
  }
  if (user && user.access_level < access_level && user.role !== "admin") {
    return <Navigate to={`/empleado/${user.id}`} replace />;
  }

  return (
    <>
      <Outlet />

      {children}
    </>
  );
};

export const PrivateRoute = ({ children }: Props) => {
  const session = useSessionStore((state) => state.session);

  if (session === undefined) {
    return <p>Loading...</p>;
  }
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // if (isSettingsPage) {
  //   return (
  //     <>
  //       <AppSidebar />
  //       <Navbar />
  //       <Outlet />
  //       {children}
  //     </>
  //   );
  // }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <PageHeader />
          {/* <Navbar /> */}
          <Outlet /> {/* This renders the protected route content */}
          {children} {/* Render children if provided */}
        </main>
      </SidebarProvider>
    </>
  );
};
