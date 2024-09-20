export default function formatDateForDisplay(date) {
  let dateFormatted = stringToDate(date);

  const day = String(dateFormatted.getDate()).padStart(2, "0");
  const month = String(dateFormatted.getMonth() + 1).padStart(2, "0");
  const year = dateFormatted.getFullYear();
  return `${day}/${month}/${year}`;
}

function stringToDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed
}
