"use client";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function ShowPasswordButton({
  toggleShowPassword,
  showPassword = false,
}) {
  return (
    <button
      onClick={toggleShowPassword}
      type="button"
      className="absolute right-5 top-1/2 -translate-y-1/2 z-10"
    >
      {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
    </button>
  );
}
