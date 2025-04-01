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
//TODO: 1: Deficiente, 2: Irregular, 3: Aceptable, 4: Bueno, > 4.5: Excelente o Sobresaliente

export const representScore = (score: number) => {
  if (score <= 1) {
    return "Deficiente";
  }
  if (score <= 2) {
    return "Irregular";
  }
  if (score <= 3) {
    return "Aceptable";
  }
  if (score < 4.5) {
    return "Bueno";
  }
  if (score >= 4.5) {
    return "Excelente";
  }
  return "N/A";
};
