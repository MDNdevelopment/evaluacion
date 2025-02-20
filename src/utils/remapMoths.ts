export default function remapMonths(month: string) {
  switch (month) {
    case "01":
      return "Ene";
    case "02":
      return "Feb";
    case "03":
      return "Mar";
    case "04":
      return "Abr";
    case "05":
      return "May";
    case "06":
      return "Jun";
    case "07":
      return "Jul";
    case "08":
      return "Ago";
    case "09":
      return "Sep";
    case "10":
      return "Oct";
    case "11":
      return "Nov";
    case "12":
      return "Dic";
    default:
      return "Error";
  }
}
