import { NavLink, useLocation } from "react-router-dom";
import { useAtom } from "jotai";
import { memo, useEffect } from "react";
import { IconLayoutSidebarFilled, IconSmartHome } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { mobileSidebarOpenAtom } from "@/store/topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { Counts, IApi } from "@/lib/types";
import NewNoteButton from "./new-note-button";
import FoldersWrapper from "./folders-wrapper";
import LabelsWrapper from "./labels-wrapper";
import {
  AllNotesIcon,
  AppLogoIcon,
  ArchiveIcon,
  TodoIcon,
} from "@/components/icons";

const navItems = [
  { to: "/", label: "All Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: TodoIcon },
  { to: "/archive", label: "Archive", icon: ArchiveIcon },
] as const;

const countKeys: Record<(typeof navItems)[number]["to"], keyof Counts> = {
  "/": "notes",
  "/todos": "todos",
  "/archive": "archive",
};

export const Sidebar = memo(function Sidebar() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [sidebar, setSidebar] = useLocalStorage("sidebar", true);
  const [mobileOpen, setMobileOpen] = useAtom(mobileSidebarOpenAtom);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      isMobile ? "0px" : sidebar ? "16rem" : "3.75rem",
    );
  }, [isMobile, sidebar]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return <SidebarNav sidebar={sidebar} onToggle={() => setSidebar(!sidebar)} />;
});

type SidebarNavProps = {
  sidebar: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
};

function SidebarNav({ sidebar, onToggle, onNavigate }: SidebarNavProps) {
  const { data: counts } = useApi<IApi<Counts>>({
    url: urls.NotesCounts,
    queryKey: ["notes", "counts"],
  });

  return (
    <div
      className={cn(
        "h-full",
        onToggle && "flex-none",
        onToggle && (sidebar ? "w-64" : "w-fit"),
        !onToggle && "min-h-0 w-full",
      )}
    >
      <nav
        className={cn(
          "h-full overflow-y-auto px-2.5 pt-2.5",
          onToggle && "border-r border-line",
          onToggle && (sidebar ? "w-64 sidebar-reveal" : "w-fit"),
        )}
      >
        <div
          className={cn(
            "flex justify-between items-center group",
            sidebar ? "w-full" : "w-fit",
          )}
        >
          <div
            className={cn(
              "flex gap-1.5 items-center flex-nowrap",
              sidebar && "pl-1 sidebar-logo-enter",
              !sidebar && "h-8 w-8 flex justify-center items-center",
            )}
          >
            <AppLogoIcon className="shrink-0" size={20} />
            {sidebar && (
              <p className="text-sm font-semibold text-nowrap text-ink">
                My Note
              </p>
            )}
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className={cn(
                "h-8 w-8 justify-center flex items-center text-ink-2 hover:text-ink-1 rounded-[8px] transition-[color,transform,opacity] duration-150 active:scale-[0.94] hover:cursor-pointer",
                !sidebar &&
                  "bg-surface-2 absolute opacity-0 group-hover:opacity-100",
              )}
            >
              <IconLayoutSidebarFilled width={18} height={18} />
            </button>
          )}
        </div>
        <div className={cn(sidebar && "sidebar-content-enter")}>
          <div className="mt-4 flex flex-col gap-1">
            <NewNoteButton sidebar={sidebar} />
            {navItems.map(({ to, label, icon: Icon }) => {
              const count = counts?.data?.[countKeys[to]] ?? 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onNavigate}
                  className={cn("flex w-full", !sidebar && "w-8")}
                >
                  {({ isActive }) => (
                    <span
                      className={cn(
                        "flex items-center flex-nowrap text-nowrap gap-2 h-8 px-2 text-sm font-medium w-full rounded-full pr-4",
                        isActive
                          ? "text-ink font-semibold bg-line/60"
                          : "text-ink/60 hover:text-ink",
                        !sidebar && "justify-center px-0 gap-0 h-8 w-8",
                      )}
                    >
                      {renderNavIcon(to, Icon, isActive)}
                      {sidebar && label}
                      {sidebar && +count > 0 && (
                        <span className="ml-auto text-xs font-normal text-ink-3 tabular-nums">
                          {+count}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
        <div className={cn(sidebar && "sidebar-folders-enter")}>
          <FoldersWrapper sidebar={sidebar} />
          <LabelsWrapper sidebar={sidebar} onNavigate={onNavigate} />
        </div>
      </nav>
    </div>
  );
}

function renderNavIcon(
  to: (typeof navItems)[number]["to"],
  Icon: (typeof navItems)[number]["icon"],
  isActive: boolean,
) {
  switch (to) {
    case "/":
      return (
        <AllNotesIcon
          className={cn("shrink-0 w-4.5 h-4.5", isActive && "text-blue-600")}
        />
      );
    case "/todos":
      return (
        <TodoIcon
          className={cn("shrink-0 w-4.5 h-4.5", isActive && "text-teal-600")}
        />
      );
    case "/archive":
      return (
        <ArchiveIcon
          className={cn("shrink-0 w-4.5 h-4.5", isActive && "text-amber-600")}
        />
      );
    default:
      return <Icon className="shrink-0" />;
  }
}
