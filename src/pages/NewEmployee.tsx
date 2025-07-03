import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import useDepartmentsWithPositions from "@/hooks/useDepartmentsWithPositions";
import PersonalData from "@/components/employeeCreation/PersonalData";
import JobData from "@/components/employeeCreation/JobData";
import Spinner from "@/components/Spinner";

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
  const { isLoading, setIsLoading, company, departments, positions } =
    useDepartmentsWithPositions();
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [birthDate, setBirthDate] = useState<Date | string | null | undefined>(
    undefined
  );
  const [hireDate, setHireDate] = useState<Date | string | null | undefined>(
    undefined
  );
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      position: undefined,
      department: undefined,
      access_level: 1,
      admin: false,
      phone: "",
      birth_date: undefined,
      hire_date: undefined,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (e) => {
    console.log(e);
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

    const { error } = await supabase.functions.invoke("bright-task", {
      body: {
        first_name: watch("firstName"),
        last_name: watch("lastName"),
        email: watch("email"),
        password: watch("password"),
        position_id: watch("position"),
        department_id: watch("department"),
        access_level: watch("access_level"),
        admin: watch("admin"),
        phone_number: watch("phone"),
        birth_date: watch("birth_date"),
        hire_date: watch("hire_date"),
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
    setSelectedDepartment(departments?.[0]?.department_id || null);
    setHireDate(undefined);
    setBirthDate(undefined);
    setIsLoading(false);
  };

  const customChecker = (e: any) => {
    e.preventDefault();
    if (!watch("hire_date")) {
      setError("hire_date", {
        type: "manual",
        message: "La fecha de ingreso es obligatoria",
      });
    }
    if (!watch("birth_date")) {
      setError("birth_date", {
        type: "manual",
        message: "La fecha de nacimiento es obligatoria",
      });
    }

    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (birthDate) {
      clearErrors("birth_date");
    }

    if (hireDate) {
      clearErrors("hire_date");
    }
  }, [birthDate, hireDate]);
  return (
    <div className="  p-10 ">
      {JSON.stringify(Object.keys(errors))}
      <p className="text-neutral-800 text-xl">
        Agrega un nuevo empleado a tu organización
      </p>

      <Separator className="my-4" />

      <form
        className=" w-full md:w-5/6 lg:w-4/6 xl:4/6 flex flex-col items-end "
        onSubmit={customChecker}
      >
        <PersonalData
          setValue={setValue}
          errors={errors}
          register={register}
          hireDate={hireDate}
          setHireDate={setHireDate}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
        />
        <JobData
          register={register}
          departments={departments}
          positions={positions}
          setValue={setValue}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        <button
          disabled={isLoading}
          type="submit"
          className={`${
            isLoading
              ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark "
          } mt-5 w-fit  rounded-md  px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark cursor-pointer flex items-center justify-center gap-2`}
        >
          {isLoading && <Spinner size={4} />}
          Agregar
        </button>
      </form>
    </div>
  );
}
