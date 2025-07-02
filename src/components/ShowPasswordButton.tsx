import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface Props {
  toggleShowPassword: () => void;
  showPassword: boolean;
}
export default function ShowPasswordButton({
  toggleShowPassword,
  showPassword,
}: Props) {
  return (
    <button
      onClick={toggleShowPassword}
      type="button"
      className=" absolute right-5 top-1/2 -translate-y-1/2 z-10 "
    >
      {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
    </button>
  );
}
