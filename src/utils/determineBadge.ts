import { canEvaluate } from "./canEvaluate";

export const determineBadge = (
  userDepartmentId: number,
  privileges: number,
  employeeDepartmentId: number,
  recent_evaluation_date: string
) => {
  if (privileges < 2) {
    return { type: "Danger", text: "No disponible" };
  }

  if (canEvaluate(userDepartmentId, privileges, employeeDepartmentId)) {
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
