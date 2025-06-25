import { useEffect } from "react";
import dateBetweenRange from "@/utils/dateBetweenRange";

export default function VacationsBadge({
  vacationStatus,
  vacationStartDate,
  vacationEndDate,
}: {
  vacationStatus: any;
  vacationStartDate: string;
  vacationEndDate: string;
}) {
  const ongoing = dateBetweenRange(
    new Date(vacationStartDate),
    new Date(vacationEndDate)
  );

  let statusText = "Sin asignar";
  let textColor = "text-white";
  let backgroundColor = "bg-red-500";

  if (vacationStatus === "programmed") {
    statusText = "Programadas";
    backgroundColor = "bg-yellow-500";
  } else if (vacationStatus === "fulfilled") {
    statusText = "Completadas";
    backgroundColor = "bg-green-600";
  }

  if (ongoing) {
    statusText = "En curso";
    backgroundColor = "bg-purple-500";
  }

  return (
    <span
      className={`block text-center ${backgroundColor} ${textColor} text-xs font-medium me-2 px-2.5 py-2 rounded-md`}
    >
      <p>{statusText}</p>
    </span>
  );
}
