export default function getPastMonthRange() {
  const now = new Date();

  // Calculate the first day of the current month
  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate the last day of the past month
  const lastDayOfPastMonth = new Date(firstDayOfCurrentMonth - 1);

  // Calculate the first day of the past month
  const firstDayOfPastMonth = new Date(
    lastDayOfPastMonth.getFullYear(),
    lastDayOfPastMonth.getMonth(),
    1
  );

  // Format function
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    firstDay: formatDate(firstDayOfPastMonth),
    lastDay: formatDate(lastDayOfPastMonth),
  };
}
