import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useForm, SubmitHandler, register } from "react-hook-form";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";

type Inputs = {
  password1: string;
  password2: string;
};

const errorMessages = {
  same_password: "La nueva contraseña debe ser distinta a la anterior.",
};
export default function ResetPasswordModal() {
  const [open, setOpen] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const { data, error } = await supabase.auth.updateUser({
      password: formData.password1,
    });

    if (error) {
      toast.error(errorMessages[error.code], { position: "bottom-right" });
      return;
    }

    toast.success("¡Contraseña cambiada con éxito!", {
      position: "bottom-right",
    });
    reset();
    setOpen(false);
  };
  return (
    <>
      <button
        className="bg-primary text-white rounded-lg px-5 py-1 hover:bg-primary-dark"
        onClick={() => setOpen(true)}
      >
        Cambiar
      </button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-red-600 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-modal-password data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left  w-full">
                    <div className="flex justify-between items-center pr-5">
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-xl leading-6 font-bold text-gray-900"
                        >
                          {`Cambio de contraseña`}
                        </DialogTitle>
                      </div>
                    </div>
                    <div className="">
                      <form
                        className="flex flex-col"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        <div className="flex flex-col mb-1 mt-5">
                          <label htmlFor="newPassword">Nueva contraseña</label>
                          <input
                            type="password"
                            {...register("password1", {
                              required: {
                                value: true,
                                message: "La contraseña es requerida",
                              },
                              minLength: {
                                value: 8,
                                message:
                                  "La contraseña debe tener al menos 8 caracteres",
                              },
                              maxLength: {
                                value: 25,
                                message:
                                  "La contraseña solo puede tener hasta 25 caracteres",
                              },
                            })}
                            className="p-1 border rounded-md border-gray-200 shadow-sm"
                          />
                          {errors.password1 && (
                            <p className="text-red-500 mb-2">
                              {errors.password1.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col mt-5 mb-1">
                          <label htmlFor="newPassword">
                            Confirmar contraseña
                          </label>

                          <input
                            type="password"
                            className="p-1 border rounded-md border-gray-200 shadow-sm"
                            {...register("password2", {
                              required: {
                                value: true,
                                message: "Debes confirmar la contraseña",
                              },
                              validate: {
                                confirmPassword: (value) =>
                                  value === watch("password1") ||
                                  "Las contraseñas no coinciden",
                              },
                            })}
                          />
                          {errors.password2 && (
                            <p className="text-red-500 mb-2">
                              {errors.password2.message}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-center  mt-5">
                          <input
                            className="bg-primary text-white px-5 py-1 rounded-md hover:bg-primary-dark cursor-pointer"
                            type="submit"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
