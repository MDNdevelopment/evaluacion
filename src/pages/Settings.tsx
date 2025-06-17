import { Separator } from "@/components/ui/separator";
import ResetPasswordModal from "../components/ResetPasswordModal";
import { useUserStore } from "../stores/useUserStore";
import UploadProfilePic from "@/components/UploadProfilePic";

export default function Settings() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <>
        <h1>Cargando...</h1>
      </>
    );
  }
  return (
    <div className="  p-10 ">
      <p className="text-neutral-600">
        Gestiona la configuración de tu perfil{" "}
      </p>
      <Separator className="my-4" />
      <div className="flex flex-col gap-5 lg:w-2/4 overflow-y-auto">
        <section className="">
          <div>
            <h2 className="font-medium">Seguridad</h2>
            <p className="text-sm font-light">
              Aquí puedes cambiar tu contraseña
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <ResetPasswordModal />
          </div>
          <Separator className="my-4" />
        </section>

        <section className="">
          <div>
            <h2 className="font-medium">Foto de perfil</h2>
            <p className="text-sm font-light">
              Aquí puedes cambiar tu foto de perfil
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <UploadProfilePic />
          </div>
        </section>
      </div>
    </div>
  );
}
