import { NavLink } from "react-router-dom";
import { memo } from "react";
import {
  IconLayoutSidebarFilled,
  IconSquareCheck,
  IconFileFilled,
  IconSmartHome,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useIsMobile } from "@/hooks/use-is-mobile";
import NewNoteButton from "./new-note-button";
import CategoriesWrapper from "./categories-wrapper";
import FoldersWrapper from "./folders-wrapper";

const navItems = [
  { to: "/", label: "All Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: IconSquareCheck },
] as const;

export const Sidebar = memo(function Sidebar() {
  const isMobile = useIsMobile();
  const [sidebar, setSidebar] = useLocalStorage("sidebar", true);

  if (isMobile) return null;

  return (
    <nav
      className={cn(
        "h-full overflow-y-auto p-4 transition-[width] duration-200 ease-in-out",
        sidebar ? "w-64" : "w-fit lg:p-2",
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center",
          sidebar ? "w-full" : "w-fit",
        )}
      >
        <div
          className={cn(
            "flex gap-2 items-center flex-nowrap transition-all px-2",
            !sidebar && "hidden",
          )}
        >
          <IconFileFilled
            className="shrink-0 text-ink"
            height={20}
            width={20}
          />
          <p className="text-sm font-semibold text-nowrap text-ink">My Note</p>
        </div>
        <button
          onClick={() => setSidebar(!sidebar)}
          className={cn(
            "h-8 w-8 justify-center flex items-center text-ink-2 hover:bg-surface-hi hover:text-ink rounded-[10px] transition-[background,color,transform] duration-150 active:scale-[0.94]",
            !sidebar && "w-10.5 h-10.5",
          )}
        >
          <IconLayoutSidebarFilled
            width={18}
            height={18}
            className="text-ink-3"
          />
        </button>
      </div>
      <div className="flex flex-col gap-1 mt-4">
        <NewNoteButton sidebar={sidebar} />
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center flex-nowrap text-nowrap w-full gap-2 h-8 px-2 text-[14.5px] font-medium rounded-md text-ink-2 transition-[background,color] duration-150",
                isActive
                  ? "bg-gray-200 dark:bg-[#18191D] text-ink font-semibold"
                  : "hover:bg-surface-2 hover:text-ink",
                !sidebar && "justify-center px-0 gap-0 h-10.5! w-10.5!",
              )
            }
          >
            <Icon className="shrink-0" size={20} />
            {sidebar && label}
          </NavLink>
        ))}
      </div>
      <CategoriesWrapper sidebar={sidebar} />
      <FoldersWrapper sidebar={sidebar} />
    </nav>
  );
});
