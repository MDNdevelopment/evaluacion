export const canEvaluate = (
  userAccessLevel: number,
  employeeAccessLevel: number,
  userId: string,
  employeeId: string
): boolean => {
  // User can't evaluate itself
  if (userId === employeeId) return false;

  // Privilege 1 (lowest) cannot evaluate anyone
  if (userAccessLevel === 1) return false;

  if (
    userAccessLevel >= 2 &&
    employeeId === "2d50a4e5-35db-4be5-b27a-a24d1282ce82"
  )
    return true;
  if (userAccessLevel === 2 && employeeAccessLevel <= 2)
    //Privilege 2 can evaluate only 2 and 1
    return true;

  //Privilege 3 can evaluate 3, 2 and 1
  if (userAccessLevel === 3 && employeeAccessLevel <= 3) return true;

  if (userAccessLevel === 4) return true;

  return false;
};
