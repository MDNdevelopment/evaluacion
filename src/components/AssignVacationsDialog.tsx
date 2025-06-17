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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import translateVacationStatus from "@/utils/translateVacationStatus";
export default function AssignVacationsDialog({
  employeeId,
  isVacationsDialogOpen,
  setIsVacationsDialogOpen,
  setFetchingEmployees,
  selectedEmployeeData,
  setSelectedEmployeeData,
}: {
  employeeId: string | null;
  isVacationsDialogOpen: boolean;
  setIsVacationsDialogOpen: (val: boolean) => void;
  setFetchingEmployees: (val: boolean) => void;
  selectedEmployeeData: any;
  setSelectedEmployeeData: (val: any) => void;
}) {
  const [vacationsRange, setVacationsRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    status?: string;
  }>({
    startDate: undefined,
    endDate: undefined,
    status: undefined,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [foundVacationId, setFoundVacationId] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const startYear = new Date().getFullYear() - 15;
  const endYear = startYear + 17; // Assuming you want to show the next year as well
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );

  const parseLocalDate = (str: string) => {
    const [year, month, day] = str.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const setVacationStatus = (startDate: Date, endDate: Date) => {
    const today = Date.now();

    if (today > endDate.valueOf()) {
      return "fulfilled";
    }

    if (startDate.valueOf() <= today && endDate.valueOf() >= today) {
      return "ongoing";
    }

    return "programmed";
  };

  useEffect(() => {
    setIsLoading(true);

    setSelectedYear(new Date().getFullYear().toString());
    if (!employeeId) return;
    handleYearChange(new Date().getFullYear().toString());
    setIsLoading(false);
  }, [employeeId, isVacationsDialogOpen, selectedEmployeeData]);

  const handleSubmit = async (e: any) => {
    setIsInserting(true);
    setIsLoading(true);
    e.preventDefault();
    if (!employeeId) return;
    if (!vacationsRange.startDate || !vacationsRange.endDate) {
      alert("Please select a valid date range.");
      setIsInserting(false);
      setIsLoading(false);
      return;
    }

    const vacationStatus = setVacationStatus(
      vacationsRange.startDate,
      vacationsRange.endDate
    );

    if (!foundVacationId) {
      setIsLoading(true);
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
        setIsLoading(false);
        setIsInserting(false);

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

        setIsLoading(false);
        setIsInserting(false);

        return;
      }
    }
    toast.success("Vacaciones asignadas con éxito", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setIsVacationsDialogOpen(false);
    setVacationsRange({ startDate: undefined, endDate: undefined });
    setFetchingEmployees(true);
    setIsLoading(false);
    setIsInserting(false);
  };

  const handleResetVacations = async (
    e: any,
    foundVacationId: number | null
  ) => {
    setIsResetting(true);
    e.preventDefault();
    setIsLoading(true);
    if (!employeeId) {
      setIsLoading(false);
      setIsResetting(false);
      return;
    }
    const response = await supabase
      .from("vacations")
      .delete()
      .eq("user_id", employeeId)
      .eq("id", foundVacationId);
    if (response.error) {
      console.error("Error resetting vacations:", response.error.message);
      toast.error("Error al restablecer las vacaciones", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setIsResetting(false);
      setIsLoading(false);
      return;
    }

    toast.success("Vacaciones restablecidas con éxito", {
      position: "bottom-right",
      autoClose: 4000,
    });
    setSelectedEmployeeData({
      ...selectedEmployeeData,
      vacations: selectedEmployeeData.vacations?.filter(
        (vacation: any) => vacation.id !== foundVacationId
      ),
    });
    setVacationsRange({ startDate: undefined, endDate: undefined });
    setFetchingEmployees(true);
    setIsLoading(false);
    setIsResetting(false);
  };

  const handleYearChange = (year: string) => {
    const vacation = selectedEmployeeData.vacations?.find((vacation: any) =>
      vacation.start_date.includes(year)
    );

    if (vacation) {
      console.log({ vacation });
      setVacationsRange({
        startDate: parseLocalDate(vacation.start_date),
        endDate: parseLocalDate(vacation.end_date),
        status: vacation.status,
      });
      setFoundVacationId(vacation.id);
    } else {
      setFoundVacationId(null);
      setVacationsRange({
        startDate: undefined,
        endDate: undefined,
        status: undefined,
      });
    }
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
              <div className="flex flex-row items-center gap-4 mb-5">
                <Label htmlFor="username" className="text-right w-2/5">
                  Año:
                </Label>
                <Select
                  onValueChange={(e) => {
                    setSelectedYear(e);
                    handleYearChange(e);
                  }}
                  value={selectedYear}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[90px] focus:ring-none ">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((years) => (
                      <SelectItem
                        className="cursor-pointer hover:bg-neutral-100"
                        key={years}
                        value={years.toString()}
                      >
                        {years}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row items-center gap-4">
                <Label htmlFor="username" className="text-right w-2/5">
                  Vacaciones:
                </Label>

                <div className="w-3/5">
                  <DatePickerWithRange
                    startYear={parseInt(selectedYear)}
                    endYear={parseInt(selectedYear) + 1}
                    disabled={
                      selectedYear < new Date().getFullYear().toString() ||
                      vacationsRange.status === "fulfilled" ||
                      isLoading
                    }
                    vacationsRange={vacationsRange}
                    setVacationsRange={setVacationsRange}
                  />

                  {translateVacationStatus(vacationsRange.status)}
                </div>
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
                  disabled={
                    !foundVacationId ||
                    vacationsRange.status === "fulfilled" ||
                    isLoading
                  }
                  onClick={(e) => handleResetVacations(e, foundVacationId)}
                  variant={"outline"}
                >
                  Restablecer
                  {isResetting && <Spinner />}
                </Button>

                <Button
                  disabled={
                    !vacationsRange.startDate ||
                    !vacationsRange.endDate ||
                    isLoading
                  }
                  onClick={(e) => handleSubmit(e)}
                >
                  Asignar
                  {isInserting && <Spinner />}
                </Button>
              </DialogFooter>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
