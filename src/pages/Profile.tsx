import ResetPasswordModal from "../components/ResetPasswordModal";
import { useUserStore } from "../stores/useUserStore";

export default function Profile() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <>
        <h1>Cargando...</h1>
      </>
    );
  }
  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-gray-100 mt-10 shadow-md rounded-lg">
      <h1 className="text-primary text-5xl uppercase font-black">Ajustes</h1>
      <h4 className="text-gray-800 text-xl">{user.full_name}</h4>
      <h4 className="text-gray-800 ">
        {user.department} - {user.role}
      </h4>

      <div className="mt-10 font-semibold bg-white shadow-md rounded-md w-2/6 flex flex-col justify-center items-center h-32">
        <h2 className="mb-2 ">Cambia aquí tu contraseña</h2>

        <ResetPasswordModal />
      </div>
    </div>
  );
}
