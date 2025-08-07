import { useState } from "react";
import { Button } from "./ui/button";
import { FaAngleUp } from "react-icons/fa";

export const QuestionsFilter = ({
  departments,
  handlePositionClick,
  selectedPositions,
}: {
  departments: any;
  handlePositionClick: (positionId: number) => void;
  selectedPositions: number[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenerClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };

  var positionsList =
    Object.keys(departments).reduce((acc: any, curr: any) => {
      const department = departments[curr];
      // const departmentName = curr;
      department.map((position: any) =>
        acc.push({ id: position.position_id, name: position.position_name })
      );

      return acc;
    }, []) || [];

  positionsList = positionsList.sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );
  return (
    <div>
      <Button
        className={`bg-white  shadow-sm mt-3 border-x-2 border-t-2  rounded-none rounded-tl-md rounded-tr-md  hover:bg-gray-200 text-gray-800 px-4 py-2 text-sm ${
          !isMenuOpen && "rounded-br-md rounded-bl-md border-b-2"
        }`}
        onClick={handleOpenerClick}
      >
        Cargos{" "}
        <FaAngleUp
          className={`${isMenuOpen && "-scale-100"} transition-all ease-linear`}
        />
      </Button>
      {isMenuOpen && positionsList.length > 0 && (
        <div className="flex bg-gray-100 p-3 h-fit w-full overflow-x-hidden">
          <ul className="flex flex-row flex-wrap gap-3">
            {positionsList.map((position: any) => {
              return (
                <li
                  onClick={() => {
                    handlePositionClick(position.id);
                  }}
                  key={`position-${position.id}`}
                  className={`${
                    selectedPositions.includes(position.id)
                      ? "bg-primary text-white border-primary hover:bg-primary-dark hover:border-primary-dark"
                      : "bg-white"
                  } border  shadow-sm rounded-md py-1 px-2 text-sm cursor-pointer hover:bg-gray-200`}
                >
                  {position.name}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
