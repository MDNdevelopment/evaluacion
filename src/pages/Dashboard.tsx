import { useUserStore } from "../stores/useUserStore";
import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
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
      <h1>Inicio</h1>
      <h2>Bienvenido, {user?.full_name}</h2>

      {user?.privileges === 3 && (
        <Button variant="contained">Nuevo empleado</Button>
      )}

      <Box sx={{ mt: 5 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleLogOut()}
        >
          Cerrar Sesión
        </Button>
      </Box>
      <Outlet />
    </>
  );
}
