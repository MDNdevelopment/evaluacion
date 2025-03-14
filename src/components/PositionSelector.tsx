import { Position } from "@/types";
import PositionItem from "./PositionItem";

export function PositionSelector({
  positions,
}: {
  positions: { [key: string]: Position[] };
}) {
  //

  return (
    <div className="flex flex-col">
      <div className=" grid grid-cols-4">
        {Object.keys(positions).map((departmentName: string) => {
          return (
            <div
              key={departmentName}
              className="flex flex-col  my-3 border border-gray-200 p-4 rounded-md mx-1"
            >
              <h4 className="mb-2 font-bold text-md hover:underline cursor-pointer">
                {departmentName}
              </h4>
              {positions[departmentName].map((position: Position) => {
                return (
                  <PositionItem
                    key={`${departmentName}-${position.id}`}
                    position={position}
                    departmentName={departmentName}
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
