import { supabase } from "../services/supabaseClient";
import { User } from "../stores/useUserStore";
import { Company } from "@/types";

interface Props {
  email: string;
  password: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setSession: (session: any) => void;
}

export const loginUser = async ({
  email,
  password,
  setError,
  setUser,
  setCompany,
  setSession,
}: Props) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    console.log(error);
    console.log(error.message);
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
            positions(position_name, position_id),
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
      console.log(employeeData);
      setUser({
        id: userId,
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        email: employeeData.email,
        department_id: employeeData.department_id,
        department_name: employeeData.departments.department_name,
        position_id: employeeData.positions.position_id,
        position_name: employeeData.positions.position_name,
        access_level: employeeData.access_level,
        company_id: employeeData.company_id,
        admin: employeeData.admin,
      });

      setCompany({
        id: employeeData.companies.id,
        name: employeeData.companies.name,
        created_at: employeeData.companies.created_at,
        owner_user_id: employeeData.companies.owner_user_id,
        logo_url: employeeData.companies.logo_url,
      });

      console.log(data);
      setSession(data.session);

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
  const { error } = await supabase.auth.signOut();
  return error;
};
