export default function dateDifference(
  startDate: string | Date,
  endDate: string | Date
) {
  let start = new Date(startDate);
  let end = new Date(endDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  console.log(`Difference: ${years} years, ${months} months, ${days} days`);
  // Return the difference as an object

  return `(${years > 0 ? `${years} año${years > 1 ? "s" : ""}, ` : ""}${
    months > 0 ? `${months} mes${months > 1 ? "es" : ""}, ` : ""
  }${days} día${days > 1 ? "s" : ""})`;
}
