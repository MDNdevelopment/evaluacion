const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginUser = async (email, password) => {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    console.log(authError.message);
    return {
      error: authError.message,
      ok: false,
    };
  }

  if (authData) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, departments(id, name)`)
      .eq("user_id", authData.user.id)
      .single();

    if (userError) {
      console.log(userError.message);
      return {
        ok: false,
      };
    }

    const tokenPayload = {
      userId: authData.user.id,
      email: authData.user.email,
    };
    const accessToken = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "7d",
    });

    return {
      ok: true,
      token,
      userData,
    };
  }
};

module.exports = {
  loginUser,
};

// const { data: employeeData } = await supabase
//       .from("users")
//       .select(
//         `
//             *,
//             departments (
//             id,
//             name
//             )
//             `
//       )
//       .eq("user_id", userId)
//       .single();

// export const loginUser = async ({
//   email,
//   password,
//   setError,
//   setUser,
// }: Props) => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     setError(error.message);
//     return {
//       ok: false,
//     };
//   } else if (data && data.session) {
//     const userId = data.user.id;
//     //Get the employee data from database
//     const { data: employeeData } = await supabase
//       .from("users")
//       .select(
//         `
//             *,
//             departments (
//             id,
//             name
//             )
//             `
//       )
//       .eq("user_id", userId)
//       .single();
//     if (employeeData) {
//       setUser({
//         id: userId,
//         full_name: `${employeeData.first_name} ${employeeData.last_name}`,
//         email: employeeData.email,
//         department_id: employeeData.department_id,
//         department: employeeData.departments.name,
//         role: employeeData.role,
//         privileges: employeeData.privileges,
//       });

//       Cookies.set("auth-token", data.session.access_token, { expires: 7 }); // 7-day expiration
//       return {
//         ok: true,
//       };
//     }
//   }
//   return {
//     ok: true,
//   };
// };
