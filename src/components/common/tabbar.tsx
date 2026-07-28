import { NavLink } from "react-router-dom";
import {
  IconSmartHome,
  IconSquareCheck,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: IconSquareCheck },
  { to: "/archive", label: "Archive", icon: IconArchive },
] as const;

export function Tabbar() {
  const isMobile = useIsMobile();
  const { openNew } = useDocumentActions();

  if (!isMobile) return null;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-[color] duration-150",
      isActive ? "text-ink" : "text-ink-3",
    );

  return (
    <>
      <button
        onClick={openNew}
        aria-label="New note"
        className="fixed right-1/2 translate-x-1/2 bottom-18 z-40 flex h-fit w-fit items-center justify-center rounded-full bg-surface text-ink border border-line shadow-lg transition-transform duration-150 active:scale-95 cursor-pointer pl-2 pr-2.5 gap-0.5 py-1.5 text-xs"
      >
        <IconPlus size={16} className="shrink-0" />
        <p>New Note</p>
      </button>
      <nav className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-stretch bg-surface pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={tabClass}>
            <Icon size={22} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
