import { useRef, useState } from "react";

import { Button } from "./ui/button";
import { useUserStore } from "@/stores";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import ImageCrop from "./Image crop/image-crop";

export default function UploadProfilePic() {
  const setNewAvatar = useUserStore((state) => state.setNewAvatar);
  const inputFile = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const handleFileChange = (e: any) => {
    setFileError(null); // Reset error state
    console.log("archivo seleccionado");
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
      console.log("formato de archivo no permitido", file.type);
      setFileError(
        "Formato de archivo no permitido. Formatos válidos: JPG, PNG y WEBP"
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      console.log("archivo demasiado grande", file.size);
      setFileError("El archivo es demasiado grande. Tamaño máximo: 2MB.");
      return;
    }

    console.log(file);
    setSelectedFile(file);
    setObjectUrl(URL.createObjectURL(file)); // Create a URL for the selected file
    setFileError(null); // Clear any previous error
  };
  const user = useUserStore((state) => state.user);

  const handleUploadFile = async (croppedFile: File | undefined) => {
    setUploadingAvatar(true);
    setFileError(null);
    if (!user) {
      setFileError("Usuario no encontrado. Por favor, inicia sesión.");
      return;
    }
    if (!croppedFile) {
      setFileError("Por favor, selecciona un archivo antes de subir.");
      return;
    }

    const userId = user.id;

    //get the cloudinary signature
    const { data: signatureData, error: signatureError } =
      await supabase.functions.invoke("express", {
        body: { publicId: userId, uploadPreset: "evaluacion" },
      });

    if (signatureError) {
      console.error("Error getting signature:", signatureError);
      setFileError("Error al obtener la firma de Cloudinary.");
      setUploadingAvatar(false);
      return;
    }

    console.log(signatureData);

    const { signature, timestamp } = signatureData;
    const url = "https://api.cloudinary.com/v1_1/mdnclientes/image/upload/";
    const data = new FormData();
    data.append("file", croppedFile);
    data.append("upload_preset", "evaluacion");
    data.append("signature", signature);
    data.append("timestamp", timestamp);
    data.append("public_id", userId); // Use user ID as public ID
    data.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
    const res = await fetch(url, {
      method: "POST",
      body: data,
    });

    const parsedRes = await res.json();
    if (!res.ok) {
      console.error("Error uploading file:", parsedRes);
      setFileError("Error al subir el archivo. Inténtalo de nuevo.");
      setUploadingAvatar(false);
      return;
    }
    console.log("File uploaded successfully:", parsedRes);
    // Update user profile with the new avatar URL

    if (res.ok) {
      const publicUrl = parsedRes.secure_url;
      console.log("Public URL:", publicUrl);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);
      if (updateError) {
        console.error("Error updating user profile:", updateError);
        setFileError("Error al actualizar el perfil del usuario.");
        setUploadingAvatar(false);
        return;
      }
      toast.success("Foto de perfil actualizada con éxito", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setNewAvatar(publicUrl);
      setOpen(false);
      setSelectedFile(null);
      setFileError(null); // Clear any previous error
      setUploadingAvatar(false);
      inputFile.current!.value = ""; // Reset the file input
    }
    setUploadingAvatar(false);
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
        <div className="sm:max-w-full  overflow-y-hidden flex flex-col ">
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
                {/* <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-44 h-auto object-cover rounded-md"
                /> */}

                <ImageCrop
                  handleUploadFile={handleUploadFile}
                  imgSrc={objectUrl}
                  userId={user?.id}
                  uploadingAvatar={uploadingAvatar}
                />
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
