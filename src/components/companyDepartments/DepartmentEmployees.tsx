import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export default function DepartmentEmployees({ users }: { users: any }) {
  return (
    <>
      <ul className="grid grid-cols-3 gap-3 ">
        {users && users.length > 0 ? (
          users
            .sort(
              (userA: any, userB: any) =>
                userB.access_level - userA.access_level
            )
            .map((user: any) => (
              <li
                className="border border-neutral-200 rounded-lg  flex flex-col shadow-sm bg-neutral-50"
                key={user.user_id}
              >
                <div className="flex items-center justify-center gap-2 pt-4 flex-grow-0 ">
                  <img
                    src={
                      user.avatar_url ||
                      "https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/user-profile.png"
                    }
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <span className="text-center my-2 text-xl font-light">{`${user.first_name} ${user.last_name}`}</span>
                <div className="bg-neutral-800 px-3 py-4 rounded-b-md text-neutral-50 flex-1 flex-grow-1">
                  <div className="flex gap-2">
                    <span className="font-light text-xs">Cargo:</span>
                    <span className="font-bold text-xs ">{`${user.position.position_name}`}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-light text-xs">Nivel de acceso:</span>
                    <span className="text-center font-bold text-xs ">{`${user.access_level}`}</span>
                  </div>
                  <div className=" flex justify-center mt-3">
                    <Link
                      to={`/empleado/${user.user_id}`}
                      className="bg-neutral-50 text-neutral-800 rounded-full text-xs font-medium py-1 px-3 hover:bg-neutral-200 ease-linear transition-all duration-200"
                    >
                      Perfil
                    </Link>
                  </div>
                </div>
              </li>
            ))
        ) : (
          <li className="p-2 text-neutral-500 col-span-3">
            No hay empleados en este departamento
          </li>
        )}
      </ul>
    </>
  );
}
