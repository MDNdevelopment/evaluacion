import { createPortal } from "react-dom";

export default function Tooltip({
  children,
  position,
  show,
}: {
  children: React.ReactNode;
  position: { top: number; left: number };
  show: boolean;
}) {
  if (!show) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        transform: "translateX(-50%)",
        // your styles...
      }}
      className="bg-white rounded-md border border-neutral-200 py-0.5 px-2 text-xs"
    >
      {children}
    </div>,
    document.body
  );
}
