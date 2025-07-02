export default function parseLocalDate(str: string) {
  if (!str) return undefined;
  const [year, month, day] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}
