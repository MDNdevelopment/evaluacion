export default function remapMonths(month: string) {
  switch (month) {
    case "Ene":
      return "01";
    case "Feb":
      return "02";
    case "Mar":
      return "03";
    case "Abr":
      return "04";
    case "May":
      return "05";
    case "Jun":
      return "06";
    case "Jul":
      return "07";
    case "Ago":
      return "08";
    case "Sep":
      return "09";
    case "Oct":
      return "10";
    case "Nov":
      return "11";
    case "Dic":
      return "12";
    default:
      return "Error";
  }
}
