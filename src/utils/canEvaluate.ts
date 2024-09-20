export const canEvaluate = (
  userPrivileges: number,
  employeePrivileges: number
): boolean => {
  // Privilege 3 (highest) can evaluate anyone
  if (userPrivileges === 3) return true;

  // Privilege 1 (lowest) cannot evaluate anyone
  if (userPrivileges === 1) return false;

  if (userPrivileges === 2 && employeePrivileges === 3) return false;
  if (userPrivileges === 2 && employeePrivileges <= 2) return true;

  // Privilege 2 can evaluate based on department restrictions
  // const evaluationPermissions: Record<number, number[]> = {
  //   1: [1, 2, 3], // Department 1 (Redes) can evaluate departments 1, 2, and 3
  //   2: [1, 2], // Department 2 (Audiovisual) can evaluate departments 1 and 2
  //   3: [1, 3], // Department 3 (Diseño) can evaluate departments 1 and 3
  // };

  // // Check if the user's department is allowed to evaluate the employee's department
  // return (
  //   evaluationPermissions[userDepartmentId]?.includes(employeeDepartmentId) ??
  //   false
  // );
  return true;
};
