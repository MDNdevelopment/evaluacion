import { useState } from "react";
import ShowPasswordButton from "../ShowPasswordButton";
import SingleDatePicker from "../SingleDatePicker";

export default function PersonalData({
  errors,
  register,
  setValue,
  hireDate,
  setHireDate,
  birthDate,
  setBirthDate,
}: any) {
  const [showPassword1, setShowPassword1] = useState(false);

  const toggleShowPassword1 = () => {
    setShowPassword1((prev) => !prev);
  };
  return (
    <div className="w-full">
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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
          <div className="flex flex-row items-center mt-5 px-1 ">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
              Contraseña:{" "}
            </label>
            <div className="relative h-fit w-full flex items-center mb-2">
              <input
                id="password"
                type={showPassword1 ? "text" : "password"}
                autoComplete="new-password"
                className={`block relative bg-white w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset  sm:text-sm    sm:leading-6  ${
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
            <div className="flex flex-col w-full">
              <div className="mb-2">
                <SingleDatePicker
                  identifier="birth_date"
                  setValue={setValue}
                  date={birthDate ?? undefined}
                  setDate={setBirthDate}
                />
              </div>

              {errors && errors.birth_date && (
                <p className="text-sm text-red-500  text-right">
                  {errors.birth_date.message ||
                    "La fecha de nacimiento es obligatoria"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row items-center mt-5 px-1">
            <label className="lg:w-2/6 w-4/6 lg:text-base text-sm">
              Fecha de ingreso:{" "}
            </label>
            <div className="flex flex-col w-full">
              <div className="mb-2">
                <SingleDatePicker
                  identifier="hire_date"
                  setValue={setValue}
                  date={hireDate ?? undefined}
                  setDate={setHireDate}
                />
              </div>
              {errors && errors.hire_date && (
                <p className="text-sm text-red-500  text-right">
                  {errors.hire_date.message ||
                    "La fecha de ingreso es obligatoria"}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end"></div>
        </div>
      </div>
    </div>
  );
}
