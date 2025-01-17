import { canEvaluate } from "./canEvaluate";

export const determineBadge = (
  userAccessLevel: number,
  employeeAccessLevel: number,
  recent_evaluation_date: string,

  userId: string,
  employeeId: string
) => {
  if (userAccessLevel < 2) {
    return { type: "danger", text: "No disponible" };
  }

  if (
    (userAccessLevel === 2 && employeeAccessLevel === 3) ||
    (userAccessLevel === 2 &&
      employeeAccessLevel === 4 &&
      userAccessLevel === 2 &&
      employeeId !== "2d50a4e5-35db-4be5-b27a-a24d1282ce82")
  ) {
    return { type: "danger", text: "No disponible" };
  }

  if (canEvaluate(userAccessLevel, employeeAccessLevel, userId, employeeId)) {
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
