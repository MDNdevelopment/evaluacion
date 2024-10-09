export const canEvaluate = (
  userPrivileges: number,
  employeePrivileges: number,
  userId: string,
  employeeId: string
): boolean => {
  // User can't evaluate itself
  if (userId === employeeId) return false;

  // Privilege 1 (lowest) cannot evaluate anyone
  if (userPrivileges === 1) return false;

  //Privilege 2 can evaluate only 2 and 1
  if (userPrivileges === 2 && employeePrivileges <= 2) return true;

  //Privilege 3 can evaluate 3, 2 and 1
  if (userPrivileges === 3 && employeePrivileges <= 3) return true;

  if (userPrivileges === 4) return true;

  return false;
};
