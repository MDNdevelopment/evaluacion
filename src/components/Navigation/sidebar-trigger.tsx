import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { Menu } from "lucide-react";

export default function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      className="mx-3 my-1 hover:bg-neutral-200 px-1 py-1 rounded-md transition-all duration-200 ease-linear border border-neutral-100"
      onClick={toggleSidebar}
    >
      <Menu color="#373737" size={30} />
    </button>
  );
}
