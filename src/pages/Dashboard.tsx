import { useUserStore } from "../stores/useUserStore";
import { Outlet, useNavigate } from "react-router-dom";
import { logOutUser } from "../services/AuthService";
import EvaluateModal from "../components/EvaluateModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  return (
    <div className="p-5 max-w-[1200px] bg-red-600 mx-auto">
      <h1 className="text-primary text-4xl uppercase font-black">Dashboard</h1>
      {user?.privileges === 3 && <button>Nuevo empleado</button>}

      <button color="error" onClick={() => handleLogOut()}>
        Cerrar Sesión
      </button>
    </div>
  );
}
