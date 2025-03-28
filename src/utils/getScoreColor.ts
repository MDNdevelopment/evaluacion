export const getScoreColor = (score: number) => {
  if (score >= 4) {
    return "bg-green-500";
  } else if (score >= 3) {
    return "bg-yellow-500";
  } else {
    return "bg-red-500";
  }
};
