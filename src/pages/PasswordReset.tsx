import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useForm } from "react-hook-form";
import PasswordResetForm from "../components/PasswordResetForm";
import { toast } from "react-toastify";

type Inputs = {
  email: string;
  password: string;
};

export default function PasswordReset() {
  const [recovery, setRecovery] = useState<boolean>(false);
  const [submittedForm, setSubmittedForm] = useState<boolean>(false);
  const { register, handleSubmit } = useForm<Inputs>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      { redirectTo: "https://evaluacion.mdnpublicidad.com/recuperacion" }
    );

    if (error) {
      console.log(error.message);
      toast.error("No se pudo enviar el correo", { position: "bottom-right" });
      setIsLoading(false);
      return;
    }

    setSubmittedForm(true);
    toast.success("¡Correo enviado con éxito!", { position: "bottom-right" });
    setIsLoading(false);
  });

  //   Check if the user is already authenticated and has the auth-token cookie

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event == "PASSWORD_RECOVERY") {
        setRecovery(true);
      }
    });
  }, []);
  if (recovery) {
    return <PasswordResetForm />;
  }

  return (
    <>
      <div className="flex  max-w-[500px] mx-auto mt-20 rounded-lg bg-gray-50 flex-col justify-center px-6 py-12 lg:px-4 shadow-lg 	">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/logo-MDN%202.webp?t=2024-09-11T16%3A18%3A41.815Z"
            className="mx-auto h-24 w-auto"
          />
          {submittedForm ? (
            <div>
              <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                Revisa tu correo electrónico
              </h2>
              <p className="text-center mt-2 text-gray-600">
                Se te ha enviado un correo con un link para restablecer tu
                contraseña
              </p>
            </div>
          ) : (
            <div>
              <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                Recupera tu contraseña
              </h2>
              <p className="text-center mt-2 text-gray-600">
                Ingresa la dirección de correo electrónico de tu cuenta, donde
                recibirás un link para restablecer la contraseña
              </p>
            </div>
          )}
        </div>

        {!submittedForm && (
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="email"
                    autoComplete="email"
                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={`${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary cursor-pointer hover:bg-primary-dark"
                  } flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                  disabled={isLoading}
                >
                  Restablecer
                </button>
              </div>
            </form>

            <div className="flex justify-center items-center mt-3">
              <Link
                to={"/login"}
                className="text-gray-700 text-center text-sm hover:text-gray-900"
              >
                Iniciar sesión con mi cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
