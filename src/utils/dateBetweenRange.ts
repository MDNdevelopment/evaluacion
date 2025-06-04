export default function dateBetweenRange(startDate: Date, endDate: Date) {
  const today = Date.now();

  return today >= startDate.valueOf() && today <= endDate.valueOf();
}
