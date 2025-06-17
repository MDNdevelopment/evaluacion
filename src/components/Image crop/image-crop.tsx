import React, { useState, useRef, useEffect } from "react";

import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import { canvasPreview } from "./canvas-preview";
import { useDebounceEffect } from "@/hooks/useDebounceEffect";

import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../ui/button";
import Spinner from "../Spinner";

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.

export default function ImageCrop({
  imgSrc,
  handleUploadFile,
  userId,
  uploadingAvatar,
}: {
  imgSrc: string | null;
  handleUploadFile: (file: File | undefined) => void;
  userId: string | undefined;
  uploadingAvatar: boolean;
}) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef("");

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, _setScale] = useState(1);
  const [rotate, _setRotate] = useState(0);
  const [aspect, _setAspect] = useState<number | undefined>(1);

  useEffect(() => {
    console.log("imgSrc changed");
    if (!imgSrc) {
      return;
    }
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imgSrc]);

  function onImageLoad(_e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      console.log("estoy aqui");
      setCrop({
        unit: "px",
        width: 200,
        height: 200,
        x: 0,
        y: 0,
      });
    }
  }

  async function getCropUrl() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/jpeg",
    });

    const file = new File([blob], `avatar_${userId}.jpeg`, {
      type: blob.type,
    });

    console.log(file);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    return file;
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  return (
    <div className="flex xl:flex-row flex-col gap-y-5 xl:gap-0">
      <div className="overflow-hidden flex flex-col lg:flex-row items-start justify-start  flex-1  xl:h-[600px] max-w-1/2">
        {!!imgSrc && (
          <ReactCrop
            circularCrop
            crop={crop}
            onChange={(_, percentCrop) => {
              if (percentCrop.width > 0 && percentCrop.height > 0) {
                setCrop(percentCrop);
              }
            }}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            minHeight={250}
            minWidth={250}
            maxWidth={250}
            maxHeight={250}
            className="w-auto  flex rounded-lg overflow-hidden border-2 border-neutral-700"
          >
            <img
              className="h-full w-auto object-contain"
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
      </div>
      {!!completedCrop && (
        <div className="flex flex-col flex-1 items-center pl-3 w-full">
          <div className="flex max-w-[250px] max-h-[250px] justify-stretch w-full border-2 border-neutral-700 rounded-lg overflow-hidden">
            <canvas
              className=" w-full "
              ref={previewCanvasRef}
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <div className="mt-5">
            <Button
              disabled={uploadingAvatar}
              variant="outline"
              onClick={async () => {
                const file = await getCropUrl();
                handleUploadFile(file);
                // console.log(await getCropUrl());
                console.log(file);
              }}
            >
              {uploadingAvatar && <Spinner />}
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
