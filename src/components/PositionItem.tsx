import { Position } from "@/types";
import { useFormContext } from "react-hook-form";

export default function PositionItem({
  position,
  departmentName,
}: {
  position: Position;
  departmentName: string;
}) {
  const { register } = useFormContext();
  console.log(departmentName);
  return (
    <div key={`${position.id}-${position.name}`}>
      <label key={position.id}>
        <input
          className="my-2 "
          type="checkbox"
          value={position.id}
          {...register(`positions`)}
        />
        <span className="ml-2 text-sm">{position.name}</span>
      </label>
    </div>
  );
}
