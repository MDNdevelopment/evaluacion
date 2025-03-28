export const formatScore = (score: number) => {
  //I want to return different strings based on the score number
  switch (Math.floor(score)) {
    case 1:
      return "Nunca";
    case 2:
      return "Casi nunca";
    case 3:
      return "A veces";
    case 4:
      return "Casi siempre";
    case 5:
      return "Siempre";
    default:
      return "N/A";
  }
};
