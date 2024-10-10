import { canEvaluate } from "../../src/utils/canEvaluate";
describe("canEvaluate function", () => {
  it("should allow an user with privileges 4 to evaluate anyone", () => {
    const result = canEvaluate(4, 3, "id", "secondId");
    expect(result).toBe(true);

    const result2 = canEvaluate(4, 2, "id", "secondId");
    expect(result2).toBe(true);

    const result3 = canEvaluate(4, 1, "id", "secondId");
    expect(result3).toBe(true);

    const result4 = canEvaluate(4, 4, "id", "secondId");
    expect(result4).toBe(true);
  });

  it("should allow level 3 users to evaluate only from 1 to 3", () => {
    const result = canEvaluate(3, 1, "id", "id2");
    expect(result).toBe(true);
    const result2 = canEvaluate(3, 2, "id", "id2");
    expect(result2).toBe(true);
    const result3 = canEvaluate(3, 3, "id", "id2");
    expect(result3).toBe(true);
    const result4 = canEvaluate(3, 4, "id", "id2");
    expect(result4).toBe(false);
  });

  it("should allow level 2 users to evaluate only from 1 to 2", () => {
    const result = canEvaluate(2, 1, "id", "id2");
    expect(result).toBe(true);
    const result2 = canEvaluate(2, 2, "id", "id2");
    expect(result2).toBe(true);
    const result3 = canEvaluate(2, 3, "id", "id2");
    expect(result3).toBe(false);
    const result4 = canEvaluate(2, 4, "id", "id2");
    expect(result4).toBe(false);
  });

  it("should not allow level 1 users to evaluate anybody", () => {
    const result = canEvaluate(1, 1, "id", "id2");
    expect(result).toBe(false);
    const result2 = canEvaluate(1, 2, "id", "id2");
    expect(result2).toBe(false);
    const result3 = canEvaluate(1, 3, "id", "id2");
    expect(result3).toBe(false);
    const result4 = canEvaluate(1, 4, "id", "id2");
    expect(result4).toBe(false);
  });

  it("should allow every level 2,3 and 4 user to evaluate Juan lauretta", () => {
    const result = canEvaluate(
      2,
      4,
      "user",
      "2d50a4e5-35db-4be5-b27a-a24d1282ce82"
    );
    expect(result).toBe(true);
    const result2 = canEvaluate(
      3,
      4,
      "user",
      "2d50a4e5-35db-4be5-b27a-a24d1282ce82"
    );
    expect(result2).toBe(true);
    const result3 = canEvaluate(
      4,
      4,
      "user",
      "2d50a4e5-35db-4be5-b27a-a24d1282ce82"
    );
    expect(result3).toBe(true);
  });
});
