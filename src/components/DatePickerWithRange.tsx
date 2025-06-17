import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
  className,
  vacationsRange,
  setVacationsRange,
  disabled,
  startYear,
  endYear,
}: {
  className?: React.HTMLAttributes<HTMLDivElement>;
  vacationsRange: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    status?: string | undefined;
  };
  setVacationsRange: (range: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => void;
  disabled?: boolean;
  startYear: number;
  endYear: number;
}) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: vacationsRange.startDate,
    to: vacationsRange.endDate,
  });

  useEffect(() => {
    setDate({
      from: vacationsRange.startDate,
      to: vacationsRange.endDate,
    });
  }, [vacationsRange]);

  return (
    <div className={cn("grid gap-2 ", className)}>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Escoge un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(e) => {
              console.log(e);
              const fromDate = e?.from;
              const toDate = e?.to;

              // const fromDateFormatted = fromDate?.toISOString().slice(0, 10);
              // const toDateFormatted = toDate?.toISOString().slice(0, 10);

              setVacationsRange({
                startDate: fromDate || undefined,
                endDate: toDate || undefined,
              });
              setDate(e);
            }}
            numberOfMonths={2}
            locale={es}
            fromYear={startYear}
            toYear={endYear}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
