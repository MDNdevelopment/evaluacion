import { canEvaluate } from "./canEvaluate";

export const determineBadge = (
  userPrivileges: number,
  employeePrivileges: number,
  recent_evaluation_date: string,
  employee_lastName: string
) => {
  if (userPrivileges < 2) {
    return { type: "Danger", text: "No disponible" };
  }

  if (userPrivileges === 2 && employeePrivileges === 3) {
    return { type: "danger", text: "No disponible" };
  }

  if (canEvaluate(userPrivileges, employeePrivileges)) {
    console.log({ employee_lastName, employeePrivileges, userPrivileges });

    if (!!recent_evaluation_date) {
      return {
        type: "success",
        text: "Evaluado",
      };
    }

    return {
      type: "warning",
      text: "Por evaluar",
    };
  }

  return { type: "danger", text: "No disponible" };
};
