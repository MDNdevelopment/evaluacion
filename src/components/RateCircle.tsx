interface Props {
  label: number;
  value: number;
}

const renameLabel = (label: number) => {
  switch (label) {
    case 0:
      return "Calidad";
    case 1:
      return "Responsabilidad";
    case 2:
      return "Compromiso Institucional";
    case 3:
      return "Iniciativa";
    case 4:
      return "Comunicación efectiva";
    case 5:
      return "Cumplimiento de procesos";
  }
};

export default function RateCircle({ label, value }: Props) {
  return (
    <div className="mb-4 lg:mb-0 flex flex-col items-center mx-2  overflow-clip h-full">
      <div className="w-[38px] h-[38px] flex justify-center items-center rounded-full bg-primary-dark ">
        <p className="text-white font-bold">{value}</p>
      </div>
      <div className="flex-1  flex justify-center items-start">
        <p className="text-[12px] mt-2 leading-4 text-gray-800 text-center">
          {renameLabel(label)}
        </p>
      </div>
    </div>
  );
}
