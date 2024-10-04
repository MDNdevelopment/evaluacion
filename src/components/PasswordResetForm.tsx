import { useForm } from "react-hook-form";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Inputs = {
  password1: string;
  password2: string;
};

export default function PasswordResetForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password1,
    });
    if (error) {
      console.log(error);
      return;
    }
    toast.success("¡Contraseña cambiada con éxito!", {
      position: "bottom-right",
    });
    navigate("/login", { replace: true });
  });
  return (
    <>
      <div className="flex min-h-full max-w-[500px] mx-auto mt-20 rounded-lg bg-gray-50 flex-col justify-center px-6 py-12 lg:px-4 shadow-lg 	">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/logo-MDN%202.webp?t=2024-09-11T16%3A18%3A41.815Z"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Nueva contraseña
          </h2>
        </div>

        <p className="text-center mt-2 text-gray-600">
          Ingresa la nueva contraseña que deseas usar para tu cuenta
        </p>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password1"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Contraseña
                  </label>
                </div>

                <div className="mt-2">
                  <input
                    type="password"
                    id="password1"
                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("password1", {
                      required: {
                        value: true,
                        message: "La contraseña es requerida",
                      },
                      minLength: {
                        value: 8,
                        message: "La contraseña debe tener mínimo 8 caracteres",
                      },
                      maxLength: {
                        value: 25,
                        message:
                          "La contraseña debe tener máximo 25 caracteres",
                      },
                    })}
                  />
                </div>
                {errors && errors.password1 && (
                  <p className="text-sm text-red-500  text-right">
                    {errors.password1.message}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password2"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Confirmar contraseña
                  </label>
                </div>

                <div className="mt-2">
                  <input
                    type="password"
                    id="password2"
                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("password2", {
                      required: {
                        value: true,
                        message: "Debes confirmar la contraseña",
                      },
                      validate: {
                        confirmPassword: (value) =>
                          value === watch("password1").toString() ||
                          "Las contraseñas no coinciden",
                      },
                    })}
                  />
                </div>
                {errors && errors.password2 && (
                  <p className="text-sm text-red-500  text-right">
                    {errors.password2.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
