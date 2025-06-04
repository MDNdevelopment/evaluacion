import { useEffect, useState } from "react";

import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { Button } from "./ui/button";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
export default function AssignVacationsDialog({
  employeeId,
  isVacationsDialogOpen,
  setIsVacationsDialogOpen,
  setFetchingEmployees,
}: {
  employeeId: string | null;
  isVacationsDialogOpen: boolean;
  setIsVacationsDialogOpen: (val: boolean) => void;
  setFetchingEmployees: (val: boolean) => void;
}) {
  const [vacationsRange, setVacationsRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [isVacationSet, setIsVacationSet] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploadingData, setUploadingData] = useState<boolean>(false);
  const [sendingData, setSendingData] = useState<boolean>(false);
  const [foundVacationId, setFoundVacationId] = useState<number | null>(null);

  const parseLocalDate = (str: string) => {
    const [year, month, day] = str.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const getEmployeeVacations = async (employeeId: string | null) => {
    const year = new Date().getFullYear();
    let yearStart = `${year}-01-01`;
    let yearEnd = `${year}-12-31`;
    if (!employeeId) return;
    const { data, error } = await supabase
      .from("vacations")
      .select("*")
      .eq("user_id", employeeId)
      .lte("start_date", yearEnd)
      .gte("end_date", yearStart)
      .single();

    if (error) {
      setVacationsRange({
        startDate: undefined,
        endDate: undefined,
      });
      setIsVacationSet(false);
      setIsLoading(false);
      return null;
    }

    setFoundVacationId(data.id);
    setIsVacationSet(true);
    setVacationsRange({
      startDate: parseLocalDate(data?.start_date),
      endDate: parseLocalDate(data?.end_date),
    });

    setIsLoading(false);
    return data;
  };

  const setVacationStatus = (_startDate: Date, endDate: Date) => {
    const today = Date.now();

    if (today > endDate.valueOf()) {
      return "fulfilled";
    }

    ("aun no han terminado");
    return "programmed";
  };

  useEffect(() => {
    setIsLoading(true);
    if (!employeeId) return;
    if (isVacationsDialogOpen) {
      getEmployeeVacations(employeeId);
    }
  }, [employeeId, isVacationsDialogOpen]);

  const handleSubmit = async (e: any) => {
    setUploadingData(true);
    e.preventDefault();
    if (!employeeId) return;
    if (!vacationsRange.startDate || !vacationsRange.endDate) {
      alert("Please select a valid date range.");
      return;
    }

    const vacationStatus = setVacationStatus(
      vacationsRange.startDate,
      vacationsRange.endDate
    );

    if (!isVacationSet) {
      setSendingData(true);
      const { error } = await supabase.from("vacations").insert([
        {
          user_id: employeeId,
          start_date: vacationsRange.startDate,
          end_date: vacationsRange.endDate,
          status: vacationStatus,
        },
      ]);

      if (error) {
        console.error("Error assigning vacations:", error.message);
        alert("Error assigning vacations. Please try again.");
        setSendingData(false);
        setUploadingData(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("vacations")
        .update({
          start_date: vacationsRange.startDate,
          end_date: vacationsRange.endDate,
          status: vacationStatus,
        })
        .eq("id", foundVacationId);
      if (error) {
        console.error("Error updating vacations:", error.message);
        alert("Error updating vacations. Please try again.");
        setSendingData(false);
        setUploadingData(false);
        return;
      }
    }
    toast.success("Vacaciones asignadas con éxito", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setIsVacationsDialogOpen(false);
    setVacationsRange({ startDate: undefined, endDate: undefined });
    setSendingData(false);
    setFetchingEmployees(true);
    setUploadingData(false);
  };

  const handleResetVacations = async (e: any) => {
    e.preventDefault();
    if (!employeeId) return;
    const response = await supabase
      .from("vacations")
      .delete()
      .eq("user_id", employeeId)
      .eq("status", "programmed");
    if (response.error) {
      console.error("Error resetting vacations:", response.error.message);
      toast.error("Error al restablecer las vacaciones", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    setVacationsRange({ startDate: undefined, endDate: undefined });
    setIsVacationSet(false);
    setFetchingEmployees(true);
  };
  return (
    <>
      <Dialog
        open={isVacationsDialogOpen}
        onOpenChange={setIsVacationsDialogOpen}
      >
        <DialogContent className="sm:max-w-[625px] ">
          <DialogHeader>
            <DialogTitle>Asignar vacaciones</DialogTitle>
            <DialogDescription>
              Ingresa el rango de fechas en el que el empleado estará de
              vacaciones y presiona el botón Asignar. Si deseas eliminar unas
              vacaciones ya programadas haz click en el botón restablecer.
            </DialogDescription>

            <form className="flex flex-col pt-10">
              <div className="flex flex-row items-center gap-4">
                <Label htmlFor="username" className="text-right w-2/5">
                  Próximas vacaciones:
                </Label>
                {isLoading ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <div className="w-3/5">
                    <DatePickerWithRange
                      vacationsRange={vacationsRange}
                      setVacationsRange={setVacationsRange}
                    />
                    {isVacationSet ? (
                      <p className=" text-xs text-green-700">Programadas</p>
                    ) : (
                      <p className=" text-xs text-red-700">Aún sin programar</p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-10">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsVacationsDialogOpen(false);
                  }}
                  variant={"outline"}
                >
                  Cerrar
                </Button>
                <Button
                  disabled={!isVacationSet}
                  onClick={(e) => handleResetVacations(e)}
                  variant={"outline"}
                >
                  Restablecer
                </Button>
                <Button
                  disabled={
                    !vacationsRange.startDate ||
                    !vacationsRange.endDate ||
                    sendingData ||
                    uploadingData
                  }
                  onClick={(e) => handleSubmit(e)}
                >
                  Asignar
                </Button>
              </DialogFooter>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
