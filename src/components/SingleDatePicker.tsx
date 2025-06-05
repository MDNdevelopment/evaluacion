import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import MONTHS from "@/constants/months";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SingleDatePickerProps {
  startYear?: number;
  endYear?: number;
  identifier: string;
  setValue: any;
  date: Date;
  setDate: (val: Date) => void;
}

export default function DatePicker({
  identifier,
  setValue,
  date,
  setDate,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 1,
}: SingleDatePickerProps) {
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, MONTHS.indexOf(month));
    setDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year));
    setDate(newDate);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  useEffect(() => {
    if (date) {
      setDate(date);
      return;
    }

    setDate(new Date());
  }, []);

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? (
            format(date, "LLL dd, y", { locale: es })
          ) : (
            <span>Elige una fecha</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="w-full flex justify-between">
          <Select
            onValueChange={handleMonthChange}
            value={MONTHS[getMonth(date)]}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={getYear(date).toString()}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((years) => (
                <SelectItem key={years} value={years.toString()}>
                  {years}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => {
            setValue(identifier, e);
            handleSelect(e);
          }}
          initialFocus
          locale={es}
          month={date}
          onMonthChange={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}
