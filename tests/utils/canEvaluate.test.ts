import { canEvaluate } from "../../src/utils/canEvaluate";
describe("canEvaluate function", () => {
  it("should allow an user with privileges 3 to evaluate anyone", () => {
    const result = canEvaluate(3, 3);
    expect(result).toBe(true);

    const result2 = canEvaluate(3, 2);
    expect(result).toBe(true);

    const result3 = canEvaluate(3, 1);
    expect(result).toBe(true);
  });

  it("should return false for every user with privileges 1 (he cant evaluate anybody)", () => {
    const result = canEvaluate(1, 1);
    expect(result).toBe(false);

    const result2 = canEvaluate(1, 2);
    expect(result).toBe(false);

    const result3 = canEvaluate(1, 3);
    expect(result).toBe(false);
  });

  it("Should return true if the user has privileges (2) and the employee has privileges (2) or (1)", () => {
    const result1 = canEvaluate(2, 1);
    expect(result1).toBe(true);

    const result2 = canEvaluate(2, 2);
    expect(result2).toBe(true);
  });

  it("Should return false if the user with privileges (2) tries to evaluate an employee with privileges (3)", () => {
    const result = canEvaluate(2, 3);
    expect(result).toBe(false);
  });
});
