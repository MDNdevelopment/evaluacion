import PositionItem from "./PositionItem";
import { useFormContext } from "react-hook-form";

export function PositionSelector({
  positions,
  markedPositions,
}: {
  positions: { [key: string]: any };
  markedPositions: number[];
}) {
  const { getValues, setValue } = useFormContext();

  const handleSelectAllPositions = (departmentName: string) => {
    const positionsIds = positions[departmentName].map(
      (position: any) => position.position_id
    );

    const currentPositions = getValues("positions") || [];

    if (
      positionsIds.some((positionId: any) =>
        currentPositions.includes(positionId)
      )
    ) {
      setValue(
        "positions",
        currentPositions.filter((id: number) => !positionsIds.includes(id))
      );
    } else {
      const newPositions = [...new Set([...currentPositions, ...positionsIds])];
      setValue("positions", newPositions);
    }
  };
  return (
    <div className="flex flex-col">
      <div className=" grid grid-cols-4">
        {Object.keys(positions).map((departmentName: string) => {
          return (
            <div
              key={departmentName}
              className="flex flex-col  my-3 border border-gray-200 p-4 rounded-md mx-1"
            >
              <h4
                onClick={() => {
                  handleSelectAllPositions(departmentName);
                }}
                className="mb-2 font-bold text-md hover:underline cursor-pointer"
              >
                {departmentName}
              </h4>
              {positions[departmentName].map((position: any) => {
                return (
                  <PositionItem
                    key={`${departmentName}-${position.position_id}`}
                    position={position}
                    markedPositions={markedPositions}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
