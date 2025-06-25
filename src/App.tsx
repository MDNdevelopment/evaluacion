import "./App.css";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./constants/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "./services/supabaseClient";
import { useUserStore, useSessionStore, useCompanyStore } from "./stores";

function App() {
  const setUser = useUserStore((state) => state.setUser);
  const setCompany = useCompanyStore((state) => state.setCompany);

  const getUserData = async (userId: string) => {
    const { data: employeeData, error } = await supabase
      .from("users")
      .select(
        `
            *,
            positions(position_id, position_name),
            departments(
            department_id, 
            department_name
            ),
            companies:company_id(
            *)
            `
      )
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(error.message);
    }
    if (employeeData) {
      setUser({
        id: userId,
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        email: employeeData.email,
        department_name: employeeData.departments.department_name,
        department_id: employeeData.department_id,
        avatar_url: employeeData.avatar_url,
        position_id: employeeData.positions.position_id,
        position_name: employeeData.positions.position_name,
        access_level: employeeData.access_level,
        company_id: employeeData.company_id,
        role: employeeData.role,
      });

      setCompany({
        id: employeeData.companies.id,
        name: employeeData.companies.name,
        created_at: employeeData.companies.created_at,
        owner_user_id: employeeData.companies.owner_user_id,
        logo_url: employeeData.companies.logo_url,
      });
    }
  };
  const checkSession = () => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        useSessionStore.getState().setSession(session);
        getUserData(session.user.id);
      } else {
        useSessionStore.getState().setSession(null);
      }
    });
  };

  useEffect(() => {
    checkSession();
  }, []);
  return (
    <>
      <ToastContainer />

      <RouterProvider router={router} />
    </>
  );
}

export default App;
