import { NavLink } from "react-router-dom";
import {
  IconSmartHome,
  IconSquareCheck,
  IconPlus,
} from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: IconSquareCheck },
] as const;

export function Tabbar() {
  const isMobile = useIsMobile();
  const { openNew } = useDocumentActions();

  if (!isMobile) return null;

  const [notes, todos] = tabs;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-[color] duration-150",
      isActive ? "text-ink" : "text-ink-3",
    );

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-stretch border-t border-(--line) bg-(--surface) pb-[env(safe-area-inset-bottom)]">
      <NavLink to={notes.to} end className={tabClass}>
        <notes.icon size={22} className="shrink-0" />
        {notes.label}
      </NavLink>
      <button
        onClick={openNew}
        aria-label="New note"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-3 transition-[color] duration-150 active:text-ink"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
          <IconPlus size={18} className="shrink-0" />
        </span>
        <span className="font-semibold -ml-0.5">New</span>
      </button>
      <NavLink to={todos.to} end className={tabClass}>
        <todos.icon size={22} className="shrink-0" />
        {todos.label}
      </NavLink>
    </nav>
  );
}
