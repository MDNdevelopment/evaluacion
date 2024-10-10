import { canEvaluate } from "./canEvaluate";

export const determineBadge = (
  userPrivileges: number,
  employeePrivileges: number,
  recent_evaluation_date: string,

  userId: string,
  employeeId: string
) => {
  if (userPrivileges < 2) {
    return { type: "danger", text: "No disponible" };
  }

  if (
    (userPrivileges === 2 && employeePrivileges === 3) ||
    (userPrivileges === 2 &&
      employeePrivileges === 4 &&
      userPrivileges === 2 &&
      employeeId !== "2d50a4e5-35db-4be5-b27a-a24d1282ce82")
  ) {
    return { type: "danger", text: "No disponible" };
  }

  if (canEvaluate(userPrivileges, employeePrivileges, userId, employeeId)) {
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
