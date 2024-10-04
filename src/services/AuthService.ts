import { supabase } from "../services/supabaseClient";
import Cookies from "js-cookie";
import { User } from "../stores/useUserStore";

interface Props {
  email: string;
  password: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: (user: User) => void;
}

export const loginUser = async ({
  email,
  password,
  setError,
  setUser,
}: Props) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return {
      ok: false,
    };
  } else if (data && data.session) {
    const userId = data.user.id;
    //Get the employee data from database
    const { data: employeeData } = await supabase
      .from("users")
      .select(
        `
            *,
            departments (
            id, 
            name
            )
            `
      )
      .eq("user_id", userId)
      .single();
    console.log(employeeData);
    if (employeeData) {
      setUser({
        id: userId,
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        email: employeeData.email,
        department_id: employeeData.department_id,
        department: employeeData.departments.name,
        role: employeeData.role,
        privileges: employeeData.privileges,
      });

      Cookies.set("auth-token", data.session.access_token, { expires: 7 }); // 7-day expiration
      return {
        ok: true,
      };
    }
  }
  return {
    ok: true,
  };
};

export const logOutUser = async () => {
  console.log("logging out");
  const { error } = await supabase.auth.signOut();
  localStorage.removeItem("user-storage");
  Cookies.remove("auth-token");
  return error;
};
