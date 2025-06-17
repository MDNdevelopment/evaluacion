export default function translateVacationStatus(status?: string) {
  switch (status) {
    case "programmed":
      return <p className=" text-xs text-yellow-500">Programadas</p>;
    case "fulfilled":
      return <p className=" text-xs text-green-700">Completadas</p>;
    case "ongoing":
      return <p className=" text-xs text-purple-700">En curso</p>;

    default:
      return <p className=" text-xs text-red-700">Sin asignar</p>;
  }
}
