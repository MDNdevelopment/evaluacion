import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function PositionItem({
  position,
  markedPositions,
}: {
  position: any;
  markedPositions: number[];
}) {
  const { setValue, getValues, watch } = useFormContext();
  // Watch the current state of "positions" in the form
  const positions = watch("positions") || [];

  // Set initial checked state based on `markedPositions`
  useEffect(() => {
    if (markedPositions.includes(position.position_id)) {
      const currentPositions = getValues("positions") || [];
      if (!currentPositions.includes(position.position_id)) {
        setValue("positions", [...currentPositions, position.position_id]);
      }
    }
  }, [markedPositions, position.position_id, getValues, setValue]);

  // Handle manual toggle of the checkbox
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentPositions = getValues("positions") || [];
    if (event.target.checked) {
      // Add the position ID if checked
      setValue("positions", [...currentPositions, position.position_id]);
    } else {
      // Remove the position ID if unchecked
      setValue(
        "positions",
        currentPositions.filter((id: number) => id !== position.position_id)
      );
    }
  };

  return (
    <div key={`${position.id}-${position.name}`}>
      <label key={position.id}>
        <input
          className="my-2"
          type="checkbox"
          value={position.position_id}
          checked={positions.includes(position.position_id)} // Controlled by the form state
          onChange={handleChange} // Handle manual toggle
        />
        <span className="ml-2 text-sm">{position.position_name}</span>
      </label>
    </div>
  );
}
