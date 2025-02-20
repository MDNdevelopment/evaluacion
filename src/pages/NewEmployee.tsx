import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ShowPasswordButton from "../components/ShowPasswordButton";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";
import { useCompanyStore } from "@/stores";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
  department: number;
  access_level: number;
  role: string;
};

export default function NewEmployee() {
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const company = useCompanyStore((state) => state.company);
  const [departments, setDepartments] = useState<any[] | null>(null);
  const [positions, setPositions] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const toggleShowPassword1 = () => {
    setShowPassword1((prev) => !prev);
  };
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async () => {
    setCreateError(null);
    setIsloading(true);

    //First create the user in the supabase authentication service
    const { data: signUp, error } = await supabase.auth.signUp({
      email: watch("email"),
      password: watch("password"),
    });

    if (error) {
      console.log("error creating authentication user");
      setCreateError(error.message);
      setIsloading(false);
      return;
    }

    if (signUp.user) {
      //Create a new employee in the users table
      if (company) {
        const { error: errorEmployee } = await supabase.from("users").insert({
          email: watch("email"),
          department_id: watch("department"),
          user_id: signUp.user.id,
          first_name: watch("firstName"),
          last_name: watch("lastName"),
          position_id: watch("position"),
          access_level: watch("access_level"),
          role: watch("role"),
          company_id: company.id,
        });

        if (errorEmployee) {
          setIsloading(false);
          setCreateError(
            `Error al crear perfil del empleado.
          Código de error: ${errorEmployee.code}`
          );

          return;
        }
      }
    }

    toast.success("¡Empleado creado con éxito!", {
      position: "bottom-right",
    });
    setIsloading(false);
    setCreateError(null);
    reset();
  };

  const getCompanyData = async () => {
    if (company) {
      const { data: departmentsData, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", company.id);

      if (error) {
        console.log(error.message);
        return;
      }

      if (departmentsData) {
        setDepartments(departmentsData);
      }

      const { data: positionsData, error: errorPositions } = await supabase
        .from("positions")
        .select("id, name, department_id")
        .eq("company_id", company.id);

      if (errorPositions) {
        console.log(errorPositions.message);
        return;
      }

      setSelectedDepartment(departmentsData[0].id);

      //positions grouped by department id
      const groupedPositions = positionsData.reduce(
        (acc: { [key: number]: any[] }, position) => {
          if (!acc[position.department_id]) {
            acc[position.department_id] = [];
          }
          acc[position.department_id].push(position);
          return acc;
        },
        {}
      );

      setPositions(groupedPositions);
      setSelectedPosition(groupedPositions[0][0].id);

      console.log({ selectedDepartment, selectedPosition });
    }
  };

  useEffect(() => {
    getCompanyData();
  }, [company]);

  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-200 mt-10 shadow-md rounded-lg">
      <h1 className="text-slate-900 text-4xl uppercase font-black">
        Crear nuevo empleado
      </h1>

      <div>
        <div className="w-full mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-10">
            <div className=" flex flex-row">
              <div className="flex-1  mx-5">
                <h2 className="font-black text-gray-800 text-2xl">
                  Datos personales
                </h2>
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Nombre
                    </label>
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6 ${
                      errors.firstName && "ring-red-500 focus:outline-red-500"
                    }`}
                    placeholder="John"
                    {...register("firstName", {
                      minLength: {
                        value: 1,
                        message: "El nombre no puede estar vacío",
                      },
                      maxLength: {
                        value: 15,
                        message: "El nombre es muy largo",
                      },
                      required: {
                        value: true,
                        message: "El nombre es requerido",
                      },
                      pattern: {
                        value: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s-]+$/,
                        message: "El nombre no es válido",
                      },
                    })}
                  />
                  {errors && errors.firstName && (
                    <p className="text-sm text-red-500  text-right">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Apellido
                    </label>
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="given-name"
                    className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6 ${
                      errors.lastName && "ring-red-500 focus:outline-red-500"
                    }`}
                    placeholder="Doe"
                    {...register("lastName", {
                      minLength: {
                        value: 1,
                        message: "El apellido no puede estar vacío",
                      },
                      maxLength: {
                        value: 15,
                        message: "El apellido es muy largo",
                      },
                      required: {
                        value: true,
                        message: "El apellido es requerido",
                      },
                      pattern: {
                        value: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s-]+$/,
                        message: "El apellido no es válido",
                      },
                    })}
                  />
                  {errors && errors.lastName && (
                    <p className="text-sm text-red-500  text-right">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email
                    </label>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                      errors.email && "ring-red-500 focus:outline-red-500"
                    }`}
                    placeholder="Johndoe@gmail.com"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "El email es requerido",
                      },
                      minLength: {
                        value: 1,
                        message: "El email no puede estar en blanco",
                      },
                      maxLength: {
                        value: 40,
                        message: "El email es muy largo",
                      },
                      pattern: {
                        value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: "El email no es válido",
                      },
                    })}
                  />
                  {errors && errors.email && (
                    <p className="text-sm text-red-500  text-right">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Contraseña
                    </label>
                    <div className="text-sm"></div>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword1 ? "text" : "password"}
                      autoComplete="current-password"
                      className={`block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                        errors.password && "ring-red-500 focus:outline-red-500"
                      }`}
                      {...register("password", {
                        required: {
                          value: true,
                          message: "La contraseña es requerida",
                        },
                        minLength: {
                          value: 8,
                          message:
                            "La contraseña debe tener mínimo 8 caracteres",
                        },
                        maxLength: {
                          value: 25,
                          message:
                            "La contraseña debe tener máximo 25 caracteres",
                        },
                      })}
                    />

                    <ShowPasswordButton
                      toggleShowPassword={toggleShowPassword1}
                      showPassword={showPassword1}
                    />
                  </div>
                  {errors && errors.password && (
                    <p className="text-sm text-red-500  text-right">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1  mx-5">
                <h2 className="font-black text-gray-800 text-2xl">
                  Datos laborales
                </h2>

                <div className="mt-5 ">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Departamento
                    </label>
                  </div>
                  <div className="">
                    <select
                      id="department"
                      {...register("department")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                      onChange={(e) => {
                        setSelectedDepartment(parseInt(e.target.value));
                      }}
                    >
                      {departments &&
                        departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Rol
                    </label>
                  </div>
                  <div className="">
                    <select
                      id="position"
                      {...register("position")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      {positions &&
                        selectedDepartment !== null &&
                        positions[selectedDepartment].map((position: any) => {
                          console.log({ position });
                          return (
                            <option key={position.id} value={position.id}>
                              {position.name}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="access_level"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Nivel de acceso
                    </label>
                  </div>
                  <div className="">
                    <select
                      id="access_level"
                      {...register("access_level")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2 </option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="access_level"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Rol
                    </label>
                  </div>
                  <div className="">
                    <select
                      id="role"
                      {...register("role")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      <option value={"admin"}>Admin</option>
                      <option selected value={"employee"}>
                        Empleado
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/6 mx-auto">
              <button
                disabled={isLoading}
                type="submit"
                className={`${
                  isLoading
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark "
                }flex w-full justify-center rounded-md  px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark cursor-pointer`}
              >
                Agregar
              </button>
            </div>
            {createError && (
              <p className="text-center text-red-500 font-bold">
                {createError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
