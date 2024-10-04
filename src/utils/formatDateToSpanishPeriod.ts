export default function formatDateToSpanishMonthYear(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  };
  return date.toLocaleString("es-ES", options);
}
