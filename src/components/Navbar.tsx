import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "../stores/useUserStore";
import { logOutUser } from "../services/AuthService";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const handleLogOut = async () => {
    const res = await logOutUser();
    if (res === null) {
      navigate("/", { replace: true });
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", current: false, accessLevel: 2 },

    { name: "Evaluar", href: "/empleados", current: false, accessLevel: 2 },
    { name: "Resumen", href: "/resumen", current: false, accessLevel: 2 },
    {
      name: "Agregar empleado",
      href: "/dashboard/nuevo",
      current: false,
      accessLevel: 2,
      role: "admin",
    },
    {
      name: "Mi perfil",
      href: `/empleado/${user?.id}`,
      current: false,
      accessLevel: 1,
      role: "employee",
    },
    {
      name: "Organización",
      href: "/company",
      current: false,
      accessLevel: 2,
      role: "admin",
    },
  ];
  return (
    <Disclosure as="nav" className="bg-gray-800 z-[99999]">
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block h-6 w-6 group-data-[open]:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden h-6 w-6 group-data-[open]:block"
                />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img
                  alt="Your Company"
                  src="https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/logo-MDN%202.webp?t=2024-09-11T16%3A18%3A41.815Z"
                  className="h-8 w-auto"
                />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {user &&
                    navigation.map((item) => {
                      if (
                        (user.access_level >= item.accessLevel &&
                          user.role === (item?.role ?? "employee")) ||
                        user.role === "admin"
                      ) {
                        return (
                          <Link
                            key={item.name}
                            className={
                              "text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                            }
                            to={item.href}
                          >
                            {item.name}
                          </Link>
                        );
                      }
                    })}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <button
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                {/* <BellIcon aria-hidden="true" className="h-6 w-6" /> */}
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={
                        user?.avatar_url ||
                        "https://faaqjemovtyulorpdgrd.supabase.co/storage/v1/object/public/miscellaneous/user-profile.png"
                      }
                      className="h-8 w-8 rounded-full"
                    />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-[99999] mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem>
                    <Link
                      to={"/ajustes"}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      Ajustes
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <button
                      onClick={handleLogOut}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        <DisclosurePanel
          transition
          className="sm:hidden transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0"
        >
          {({ close }) => (
            <div className="space-y-1 px-2 pb-3 pt-2">
              {user &&
                navigation.map((item) => {
                  if (
                    (user.access_level >= item.accessLevel &&
                      user.role === (item?.role ?? "employee")) ||
                    user.role === "admin"
                  ) {
                    return (
                      <Link
                        onClick={() => close()}
                        key={item.name}
                        className={
                          item.current
                            ? "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        }
                        to={item.href}
                      >
                        {item.name}
                      </Link>
                    );
                  }
                })}
            </div>
          )}
        </DisclosurePanel>
      </>
    </Disclosure>
  );
}
