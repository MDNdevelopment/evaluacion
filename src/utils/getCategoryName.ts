// TODO: Find the way to avoid repeating the categories array since it is used in the form to generate the items

const CATEGORIES = [
  { name: "quality", question: "Calidad", desc: "Del trabajo que realiza." },
  {
    name: "responsibility",
    question: "Responsabilidad",
    desc: "Cumple con los compromisos adquiridos y tareas asignadas.",
  },
  {
    name: "commitment",
    question: "Compromiso institucional",
    desc: "Adhesión a los valores y propósitos de la compañía.",
  },
  {
    name: "initiative",
    question: "Iniciativa",
    desc: "Propuestas para mejorar los procesos y resultados en la dinámica.",
  },
  {
    name: "customer_service",
    question: "Comunicación efectiva",
    desc: "Comunicación efectiva interna y externa.",
  },
  {
    name: "process_tracking",
    question: "Cumplimiento de procesos",
    desc: "Sigue y responde a los canales previamente establecidos.",
  },
  { name: "total_rate", question: "Total" },
  { name: "note", question: "Nota" },
];

export const getCategoryName = (key: string) => {
  return (
    CATEGORIES.find((category) => category.name === key)?.question ||
    "No category found"
  );
};
