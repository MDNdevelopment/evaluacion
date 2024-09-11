import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { loginUser } from "../services/AuthService";
import { useForm, SubmitHandler } from "react-hook-form";
import ShowPasswordButton from "../components/ShowPasswordButton";
import { supabase } from "../services/supabaseClient";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  department: number;
  privileges: number;
};

export default function NewEmployee() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const setUser = useUserStore((state) => state.setUser);
  const [showPassword1, setShowPassword1] = useState(false);

  const toggleShowPassword1 = (e) => {
    setShowPassword1((prev) => !prev);
  };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("submitting");
    setIsloading(true);

    //First create the user in the supabase authentication service
    const { data: signUp, error } = await supabase.auth.signUp({
      email: watch("email"),
      password: watch("password"),
    });

    if (error) {
      console.log("error creating authentication user");
      setIsloading(false);
      return;
    }

    if (signUp) {
      //Create a new employee in the users table
      const { error: errorEmployee } = await supabase.from("users").insert({
        user_id: signUp.user.id,
        first_name: watch("firstName"),
        last_name: watch("lastName"),
        email: watch("email"),
        role: watch("role"),
        department_id: watch("department"),
        privileges: watch("privileges"),
      });

      if (errorEmployee) {
        setIsloading(false);

        console.log(errorEmployee);
      }

      setIsloading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pt-5">
      <h1 className="text-primary text-4xl uppercase font-black">
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
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Nombre
                    </label>
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
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
                        value: /^[A-Za-z]+$/,
                        message: "El nombre no es válido",
                      },
                    })}
                  />
                  <div className=""></div>
                </div>
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Apellido
                    </label>
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="given-name"
                    required
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
                        value: /^[A-Za-z]+$/,
                        message: "El apellido no es válido",
                      },
                    })}
                  />
                  <div className=""></div>
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
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                      errors.email && "ring-red-500 focus:outline-red-500"
                    }`}
                    placeholder="Johndoe@gmail.com"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "The email is required",
                      },
                      minLength: {
                        value: 1,
                        message: "The email cannot be blank",
                      },
                      maxLength: {
                        value: 30,
                        message: "The email is too long",
                      },
                      pattern: {
                        value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: "The email is not valid",
                      },
                    })}
                  />
                  <div className=""></div>
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
                      name="password"
                      type={showPassword1 ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className={`block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6  ${
                        errors.password && "ring-red-500 focus:outline-red-500"
                      }`}
                      {...register("password", {
                        required: {
                          value: true,
                          message: "The password is required",
                        },
                        minLength: {
                          value: 8,
                          message:
                            "The password must be at least 8 characters long",
                        },
                        maxLength: {
                          value: 25,
                          message:
                            "the password must be a maximum of 25 characters",
                        },
                      })}
                    />
                    <ShowPasswordButton
                      toggleShowPassword={toggleShowPassword1}
                      showPassword={showPassword1}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1  mx-5">
                <h2 className="font-black text-gray-800 text-2xl">
                  Datos laborales
                </h2>
                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Rol
                    </label>
                  </div>
                  <div className="">
                    <select
                      {...register("role")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      <option value="Social Media Manager">
                        Social Media Manager
                      </option>
                      <option value="Community Manager">
                        Community Manager
                      </option>
                      <option value="Redactor/a">Redactor/a</option>
                      <option value="Fotógrafo/a">Fotógrafo/a</option>
                      <option value="Tiktoker">Tiktoker</option>
                      <option value="Diseñador/a">Diseñador/a</option>
                      <option value="Editor/a de video">
                        Editor/a de video
                      </option>
                    </select>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Departamento
                    </label>
                  </div>
                  <div className="">
                    <select
                      {...register("department")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      <option value={1}>Redes</option>
                      <option value={2}>Audiovisual</option>
                      <option value={3}>Diseño</option>
                    </select>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Privilegios
                    </label>
                  </div>
                  <div className="">
                    <select
                      {...register("department")}
                      className="block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm  mb-2  sm:leading-6"
                    >
                      <option value={1}>1 (No puede calificar)</option>
                      <option value={2}>2 (Puede calificar)</option>
                      <option value={3}>3 (Admin)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/6 mx-auto">
              <button
                disabled={isLoading}
                type="submit"
                className={`flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer ${
                  isLoading &&
                  "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                }`}
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
