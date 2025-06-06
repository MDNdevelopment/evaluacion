import { useRef, useState } from "react";

import { Button } from "./ui/button";
import { useUserStore } from "@/stores";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";

export default function UploadProfilePic() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const handleFileChange = (e: any) => {
    setFileError(null); // Reset error state

    if (!e.target.files || e.target.files.length === 0) {
      setFileError("No se seleccionó ningún archivo.");
      return;
    }
    const file = e.target.files[0];
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp"
    ) {
      setFileError(
        "Formato de archivo no permitido. Formatos válidos: JPG, PNG y WEBP"
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      setFileError("El archivo es demasiado grande. Tamaño máximo: 2MB.");
      return;
    }

    console.log(file);
    setSelectedFile(file);
    setFileError(null); // Clear any previous error
  };
  const user = useUserStore((state) => state.user);

  const handleUploadFile = async () => {
    setFileError(null);
    if (!user) {
      setFileError("Usuario no encontrado. Por favor, inicia sesión.");
      return;
    }
    if (!selectedFile) {
      setFileError("Por favor, selecciona un archivo antes de subir.");
      return;
    }

    const userId = user.id;
    const fileType = selectedFile.type.split("/")[1]; // Get file type (e.g., jpg, png, webp)
    const fileName = `avatar_${userId}.${fileType}`; // Create a unique file name

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, selectedFile, { cacheControl: "3600", upsert: true });

    if (error) {
      console.error("Error uploading file:", error);
      setFileError("Error al subir el archivo. Inténtalo de nuevo.");
      return;
    }
    if (data) {
      console.log("File uploaded successfully:", data);
      // Update user profile with the new avatar URL
      if (data) {
        // Get the public URL
        const { data: publicUrlData } = await supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;
        console.log("Public URL:", publicUrl);

        const { error: updateError } = await supabase
          .from("users")
          .update({ avatar_url: publicUrl })
          .eq("user_id", userId);
        if (updateError) {
          console.error("Error updating user profile:", updateError);
          setFileError("Error al actualizar el perfil del usuario.");
          return;
        }
        toast.success("Foto de perfil actualizada con éxito", {
          position: "bottom-right",
          autoClose: 2000,
        });
        setOpen(false);
        setSelectedFile(null);
      }
    }
  };
  return (
    <>
      <Button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        variant={"outline"}
      >
        Cambiar foto de perfil
      </Button>
      {open && (
        <div className="sm:max-w-full max-h-[70vh] overflow-y-hidden flex flex-col ">
          <div className="flex flex-col items-center justify-center gap-4  w-full ">
            <p className="text-sm text-neutral-600">
              Tamaño máximo de imagen: 2MB. Formatos permitidos: JPG, PNG y WEBP
            </p>
            <div
              onClick={() => {
                // Handle file upload logic here
                inputFile.current?.click();
              }}
              className="group cursor-pointer bg-white border-2 transition-all ease-linear border-neutral-300 hover:border-gray-700 border-dashed rounded-md h-28 w-full flex items-center justify-center"
            >
              <p className="text-neutral-400 group-hover:text-gray-700 transition-all ease-linear text-sm select-none">
                Haz click aquí y selecciona tu imagen
              </p>
            </div>
            {fileError && <p className="text-red-600">{fileError}</p>}
            {selectedFile && (
              <>
                <p className="text-green-600">
                  Archivo seleccionado: {selectedFile.name}
                </p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-44 h-auto object-cover rounded-md"
                />
                <Button
                  onClick={() => {
                    // Handle file upload logic here
                    handleUploadFile();
                  }}
                  className=""
                  variant={"outline"}
                >
                  Confirmar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <input
        onChange={(e) => {
          handleFileChange(e);
        }}
        type="file"
        ref={inputFile}
        className="hidden"
      />
    </>
  );
}
