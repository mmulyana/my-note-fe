import { NavLink } from "react-router-dom";
import { memo, useEffect } from "react";
import { IconLayoutSidebarFilled, IconSmartHome } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { Counts, IApi } from "@/lib/types";
import NewNoteButton from "./new-note-button";
import FoldersWrapper from "./folders-wrapper";
import {
  AllNotesIcon,
  AppLogoIcon,
  ArchiveIcon,
  LabelsIcon,
  TodoIcon,
} from "@/components/icons";

const navItems = [
  { to: "/", label: "All Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: TodoIcon },
  { to: "/labels", label: "Labels", icon: LabelsIcon },
  { to: "/archive", label: "Archive", icon: ArchiveIcon },
] as const;

const countKeys: Record<(typeof navItems)[number]["to"], keyof Counts> = {
  "/": "notes",
  "/todos": "todos",
  "/labels": "labels",
  "/archive": "archive",
};

export const Sidebar = memo(function Sidebar() {
  const isMobile = useIsMobile();
  const [sidebar, setSidebar] = useLocalStorage("sidebar", true);
  const { data: counts } = useApi<IApi<Counts>>({
    url: urls.NotesCounts,
    queryKey: ["notes", "counts"],
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      isMobile ? "0px" : sidebar ? "16rem" : "3.75rem",
    );
  }, [isMobile, sidebar]);

  if (isMobile) return null;

  return (
    <div className={cn("h-full flex-none", sidebar ? "w-64" : "w-fit")}>
      <nav
        className={cn(
          "h-full overflow-y-auto px-2.5 pt-2.5 border-r border-line",
          sidebar ? "w-64 sidebar-reveal" : "w-fit",
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
          <button
            onClick={() => setSidebar(!sidebar)}
            className={cn(
              "h-8 w-8 justify-center flex items-center text-ink-2 hover:text-ink-1 rounded-[8px] transition-[color,transform,opacity] duration-150 active:scale-[0.94] hover:cursor-pointer",
              !sidebar &&
                "bg-surface-2 absolute opacity-0 group-hover:opacity-100",
            )}
          >
            <IconLayoutSidebarFilled width={18} height={18} />
          </button>
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
        </div>
      </nav>
    </div>
  );
});

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
    case "/labels":
      return (
        <LabelsIcon
          className={cn("shrink-0 w-4.5 h-4.5", isActive && "text-purple-500")}
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
