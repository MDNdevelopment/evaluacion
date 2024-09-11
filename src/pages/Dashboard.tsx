import { useUserStore } from "../stores/useUserStore";
import { Outlet, useNavigate } from "react-router-dom";
import { logOutUser } from "../services/AuthService";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const handleLogOut = async () => {
    console.log("clicked logout");
    const res = await logOutUser();
    console.log(res);
    if (res === null) {
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold underline">Inicio</h1>
      <h2>Bienvenido, {user?.full_name}</h2>

      {user?.privileges === 3 && <button>Nuevo empleado</button>}

      <button color="error" onClick={() => handleLogOut()}>
        Cerrar Sesión
      </button>

      <Outlet />
    </>
  );
}
