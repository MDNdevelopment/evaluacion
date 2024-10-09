import { determineBadge } from "../../src/utils/determineBadge";

describe("determineBadge function", () => {
  it("should return success and evaluado if the user was already evaluated", () => {
    const result = determineBadge(2, 2, "2024-09-13", "lauretta", "employee");
    expect(result).toEqual({ type: "success", text: "Evaluado" });
  });

  it("should return warning and pendiente if the employee hasnt been evaluadted", () => {
    const result = determineBadge(2, 2, "", "lauretta", "employee");
    expect(result).toEqual({ type: "warning", text: "Por evaluar" });
  });

  it("should return no disponible if the user is not able to evaluate (privileges 1)", () => {
    const result = determineBadge(1, 2, "", "lauretta", "employee");
    expect(result).toEqual({ type: "danger", text: "No disponible" });
  });

  it("should return no disponible if the user has privilege (2) and tries to evaluate an employee with privilege (3)", () => {
    const result = determineBadge(2, 3, "", "lauretta", "employee");
    expect(result).toEqual({ type: "danger", text: "No disponible" });
  });
});
