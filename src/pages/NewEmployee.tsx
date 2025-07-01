import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ShowPasswordButton from "../components/ShowPasswordButton";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";
import { useCompanyStore } from "@/stores";
import { Separator } from "@/components/ui/separator";
import SingleDatePicker from "@/components/SingleDatePicker";
import parseLocalDate from "@/utils/parseLocalDate";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
  department: number;
  access_level: number;
  admin: boolean;
  phone: string;
  birth_date: string;
  hire_date: string;
};

export default function NewEmployee() {
  const [birthDate, setBirthDate] = useState<Date | string | null>(null);
  const [hireDate, setHireDate] = useState<Date | string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  //   //First create the user in the supabase authentication service
  //   const { data: signUp, error } = await supabase.auth.signUp({
  //     email: watch("email"),
  //     password: watch("password"),
  //   });

  //   if (error) {
  //     console.log("error creating authentication user");
  //     setCreateError(error.message);
  //     setIsloading(false);
  //     return;
  //   }

  //   if (signUp.user) {
  //     //Create a new employee in the users table
  //     if (company) {
  //       const { error: errorEmployee } = await supabase.from("users").insert({
  //         email: watch("email"),
  //         department_id: watch("department"),
  //         user_id: signUp.user.id,
  //         first_name: watch("firstName"),
  //         last_name: watch("lastName"),
  //         position_id: watch("position"),
  //         access_level: watch("access_level"),
  //         admin: watch("admin"),
  //         company_id: company.id,
  //       });

  //       if (errorEmployee) {
  //         setIsloading(false);
  //         setCreateError(
  //           `Error al crear perfil del empleado.
  //         Código de error: ${errorEmployee.code}`
  //         );

  //         return;
  //       }
  //     }
  //   }

  //   toast.success("¡Empleado creado con éxito!", {
  //     position: "bottom-right",
  //   });
  //   setIsloading(false);
  //   setCreateError(null);
  //   reset();
  // };

  const onSubmit: SubmitHandler<Inputs> = async () => {
    if (!hireDate || !birthDate) {
      return;
    }

    setIsLoading(true);
    //Get user authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      console.log("Error getting user authentication", sessionError);
      return;
    }

    console.log({ session });
    const { error } = await supabase.functions.invoke("bright-task", {
      body: {
        firstName: watch("firstName"),
        lastName: watch("lastName"),
        email: watch("email"),
        password: watch("password"),
        position: watch("position"),
        department: watch("department"),
        access_level: watch("access_level"),
        admin: watch("admin"),
        phone: watch("phone"),
        birthDate:
          typeof birthDate === "string"
            ? parseLocalDate(birthDate)?.toISOString()
            : birthDate instanceof Date
            ? birthDate.toISOString()
            : undefined,
        hireDate:
          typeof hireDate === "string"
            ? parseLocalDate(hireDate)?.toISOString()
            : hireDate instanceof Date
            ? hireDate.toISOString()
            : undefined,
        companyId: company?.id,
      },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (error) {
      const errorMessage = await error.context.json();
      console.log({ errorMessage });
      toast.error(errorMessage.error, {
        position: "bottom-right",
        autoClose: 3500,
      });
      setIsLoading(false);
      return;
    }

    toast.success("¡Empleado creado con éxito!", {
      position: "bottom-right",
      autoClose: 3500,
    });
    reset();
    setIsLoading(false);
  };
  const getCompanyData = async () => {
    if (company) {
      const { data: departmentsData, error } = await supabase
        .from("departments")
        .select("department_id, department_name")
        .eq("company_id", company.id);

      if (error) {
        console.log(error.message);
        return;
      }

      if (departmentsData) {
        setDepartments(departmentsData);
        setValue("department", departmentsData[0].department_id);
      }

      const { data: positionsData, error: errorPositions } = await supabase
        .from("positions")
        .select("position_id, position_name, department_id")
        .eq("company_id", company.id);

      if (errorPositions) {
        console.log(errorPositions.message);
        return;
      }

      setSelectedDepartment(departmentsData[0].department_id);

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
      setSelectedPosition(groupedPositions[0][0].position_id);

      console.log({ selectedDepartment, selectedPosition });
    }
  };

  useEffect(() => {
    getCompanyData();
  }, [company]);

  useEffect(() => {
    if (selectedDepartment === null) return;
    setValue("position", positions[selectedDepartment][0].position_id);
  }, [selectedDepartment]);

  return (
    <div className="  p-10 ">
      <p className="text-neutral-800 text-xl">
        Agrega un nuevo empleado a tu organización
      </p>

      <Separator className="my-4" />

      <form className="lg:w-2/6 " onSubmit={handleSubmit(onSubmit)}>
        <h2 className="font-bold text-lg">Datos personales</h2>

        <div className="flex flex-col gap-3 ">
          <div className="">
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Nombre:{" "}
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6 ${
                  errors.firstName && "ring-red-500 focus:outline-red-500"
                }`}
                placeholder="John"
                {...register("firstName", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 1,
                    message: "El nombre no puede estar vacío",
                  },
                  maxLength: {
                    value: 15,
                    message: "El nombre es muy largo",
                  },

                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s-]+$/,
                    message: "El nombre no es válido",
                  },
                })}
              />
            </div>
            {errors && errors.firstName && (
              <p className="text-sm text-red-500  text-right">
                {errors.firstName.message}
              </p>
            )}
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Apellido:{" "}
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="given-name"
                className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6 ${
                  errors.lastName && "ring-red-500 focus:outline-red-500"
                }`}
                placeholder="Doe"
                {...register("lastName", {
                  required: "El apellido es obligatorio",
                  minLength: {
                    value: 1,
                    message: "El apellido no puede estar vacío",
                  },
                  maxLength: {
                    value: 15,
                    message: "El apellido es muy largo",
                  },

                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s-]+$/,
                    message: "El apellido no es válido",
                  },
                })}
              />
            </div>
            {errors && errors.lastName && (
              <p className="text-sm text-red-500  text-right">
                {errors.lastName.message}
              </p>
            )}
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Email:{" "}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                  errors.email && "ring-red-500 focus:outline-red-500"
                }`}
                placeholder="Johndoe@gmail.com"
                {...register("email", {
                  required: "El email es obligatorio",
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
            </div>
            {errors && errors.email && (
              <p className="text-sm text-red-500  text-right">
                {errors.email.message}
              </p>
            )}
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Teléfono:{" "}
              </label>
              <input
                id="phone"
                type="phone"
                autoComplete="phone"
                className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                  errors.phone && "ring-red-500 focus:outline-red-500"
                }`}
                placeholder="+584246023604"
                {...register("phone", {
                  required: "El teléfono es obligatorio",
                  minLength: {
                    value: 1,
                    message: "El teléfono no puede estar en blanco",
                  },
                  maxLength: {
                    value: 40,
                    message: "El teléfono es muy largo",
                  },
                })}
              />
            </div>
            {errors && errors.phone && (
              <p className="text-sm text-red-500  text-right">
                {errors.phone.message}
              </p>
            )}
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Contraseña:{" "}
              </label>
              <div className="relative w-full flex">
                <input
                  id="password"
                  type={showPassword1 ? "text" : "password"}
                  autoComplete="current-password"
                  className={`block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                    errors.password && "ring-red-500 focus:outline-red-500"
                  }`}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener mínimo 8 caracteres",
                    },
                    maxLength: {
                      value: 25,
                      message: "La contraseña debe tener máximo 25 caracteres",
                    },
                  })}
                />

                <ShowPasswordButton
                  toggleShowPassword={toggleShowPassword1}
                  showPassword={showPassword1}
                />
              </div>
            </div>
            {errors && errors.password && (
              <p className="text-sm text-red-500  text-right">
                {errors.password.message}
              </p>
            )}
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Fecha de nacimiento:{" "}
              </label>
              <SingleDatePicker
                identifier="birth_date"
                setValue={setValue}
                date={
                  typeof birthDate === "string"
                    ? parseLocalDate(birthDate) ?? new Date()
                    : birthDate || new Date()
                }
                setDate={setBirthDate}
              />
            </div>

            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Fecha de ingreso:{" "}
              </label>
              <SingleDatePicker
                identifier="hire_date"
                setValue={setValue}
                date={
                  typeof hireDate === "string"
                    ? parseLocalDate(hireDate) ?? new Date()
                    : hireDate || new Date()
                }
                setDate={setHireDate}
              />
            </div>
            <div className="flex justify-end"></div>
          </div>
        </div>

        <h2 className="font-bold text-lg mt-10">Datos laborales</h2>

        <div className="flex flex-col gap-3 ">
          <div className="">
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Departamento:{" "}
              </label>
              <select
                id="department"
                {...register("department")}
                className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                onChange={(e) => {
                  setSelectedDepartment(parseInt(e.target.value));
                }}
              >
                {departments &&
                  departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.department_id}
                    >
                      {department.department_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Puesto:{" "}
              </label>
              <select
                id="position"
                {...register("position")}
                className="block relative bg-white w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
              >
                {positions &&
                  selectedDepartment !== null &&
                  positions[selectedDepartment].map((position: any) => {
                    return (
                      <option key={position.id} value={position.position_id}>
                        {position.position_name}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Nivel de acceso:{" "}
              </label>
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

            <div className="flex flex-row items-center mt-5 px-1">
              <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
                Rol:{" "}
              </label>
              <select
                id="admin"
                {...register("admin")}
                className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
              >
                <option value="true">Admin</option>
                <option selected value="false">
                  Empleado
                </option>
              </select>
            </div>
          </div>
        </div>
        <button
          disabled={isLoading}
          type="submit"
          className={`${
            isLoading
              ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark "
          }flex mt-5 w-full justify-center rounded-md  px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark cursor-pointer`}
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
