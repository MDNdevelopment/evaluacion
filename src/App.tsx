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
    const { data: employeeData } = await supabase
      .from("users")
      .select(
        `
            *,
            departments:department_id (
            id, 
            name
            ),
            companies:company_id(
            *)
            `
      )
      .eq("user_id", userId)
      .single();
    if (employeeData) {
      setUser({
        id: userId,
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        email: employeeData.email,
        department: employeeData.departments.name,
        department_id: employeeData.department_id,
        avatar_url: employeeData.avatar_url,
        position: employeeData.position,
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
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);
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
    console.log("APP RE RENDERED");
  }, []);
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
