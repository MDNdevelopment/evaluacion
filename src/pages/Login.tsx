import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { loginUser } from "../services/AuthService";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useSessionStore } from "@/stores/useSessionStore";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setCompany = useCompanyStore((state) => state.setCompany);
  const setSession = useSessionStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    setError(null); // Reset error state
    e.preventDefault();
    const { ok } = await loginUser({
      email,
      password,
      setError,
      setUser,
      setCompany,
      setSession,
    });
    if (!ok) {
      console.log("Error login");
      setIsLoading(false);
      return;
    }
    // Set cookie with session token
    navigate("/dashboard"); // Redirect to dashboard
    setIsLoading(false);
  };

  //   Check if the user is already authenticated and has the auth-token cookie
  useEffect(() => {}, [navigate]);

  return (
    <>
      <div className="flex max-w-[500px] mx-auto mt-20 rounded-lg bg-gray-50 flex-col justify-center px-6 py-12 lg:px-4 shadow-lg 	">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/logo-MDN%202.webp?t=2024-09-11T16%3A18%3A41.815Z"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Iniciar sesión
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Contraseña
                </label>
                <div className="text-sm"></div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="pl-3 block w-full rounded-lg border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                disabled={isLoading}
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isLoading && <Spinner />}
                Entrar
              </Button>
            </div>
          </form>

          <div className="flex justify-center items-center mt-3">
            <Link
              to={"/recuperacion"}
              className="text-gray-700 text-center text-sm hover:text-gray-900"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && <p className="mt-5  text-red-600">{error}</p>}
        </div>
      </div>
    </>
  );
}
