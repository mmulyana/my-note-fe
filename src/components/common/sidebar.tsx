import { useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { memo, useState } from "react";
import { request } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import {
  IconLayoutSidebarFilled,
  IconSquareCheck,
  IconFileFilled,
  IconSmartHome,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useLocalStorage } from "../../hooks/use-local-storage";
import { CategoryItem } from "./category-item";
import NewNoteButton from "./new-note-button";

export interface SidebarCounts {
  notes: number;
  archive: number;
  labels: Record<string, number>;
}

const navItems = [
  { to: "/", label: "All Notes", icon: IconSmartHome },
  { to: "/todos", label: "Todo", icon: IconSquareCheck },
] as const;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = memo(function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const queryClient = useQueryClient();
  const [sidebar, setSidebar] = useLocalStorage("sidebar", true);

  const [newName, setNewName] = useState("");

  const { data } = useApi<IApi<any[]>>({
    url: urls.Categories,
    queryKey: ["categories"],
  });

  const { mutate: createCatagory } = useApi<IApi<any>, Partial<any>>({
    url: urls.Categories,
    method: "POST",
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["categories"],
        (prev: IApi<any[]> | undefined) => {
          if (!prev) return res;
          return {
            ...prev,
            data: [...(prev.data || []), res.data],
          };
        },
      );
    },
  });

  const addCategory = () => {
    const name = newName.trim();
    if (!name) return;
    createCatagory({ name });
    setNewName("");
  };

  const removeCategory = async (id: string) => {
    const response = await request<IApi<any>>(`${urls.Categories}/${id}`, {
      method: "DELETE",
    });
    if (response.message.includes("deleted")) {
      queryClient.setQueryData(
        ["categories"],
        (prev: IApi<any[]> | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: prev.data.filter((c) => c.id !== id),
          };
        },
      );
    }
  };

  const handleEditCategory = async (id: string, name: string) => {
    const response = await request<IApi<any>>(`${urls.Categories}/${id}`, {
      method: "PATCH",
      body: {
        name,
      },
    });
    if (response.message.includes("updated")) {
      queryClient.setQueryData(
        ["categories"],
        (prev: IApi<any[]> | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: prev.data.map((c) => (c.id === id ? { ...c, name } : c)),
          };
        },
      );
    }
  };

  const effectiveSidebar = mobileOpen ? true : sidebar;

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 h-full z-50 w-64 overflow-y-auto p-4 bg-surface",
        "transition-transform duration-200 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:static md:translate-x-0 md:transition-[width] md:bg-transparent",
        sidebar ? "md:w-64" : "w-fit md:w-fit lg:p-2",
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center",
          effectiveSidebar ? "w-full" : "w-fit",
        )}
      >
        <div
          className={cn(
            "flex gap-2 items-center flex-nowrap transition-all px-2",
            !effectiveSidebar && "hidden",
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
            "h-8 w-8 justify-center hidden md:flex items-center text-ink-2 hover:bg-surface-hi hover:text-ink rounded-[10px] transition-[background,color,transform] duration-150 active:scale-[0.94]",
            !sidebar && "w-10.5 h-10.5",
          )}
        >
          <IconLayoutSidebarFilled
            width={18}
            height={18}
            className="text-ink-3"
          />
        </button>
        <button
          onClick={() => onMobileClose()}
          className={cn(
            "absolute top-0 right-0 h-8 w-8 justify-center md:hidden flex items-center text-ink-2 hover:bg-surface-hi hover:text-ink rounded-[10px] transition-[background,color,transform] duration-150 active:scale-[0.94]",
            !sidebar && "w-10.5 h-10.5",
          )}
        >
          <IconX width={18} height={18} className="text-ink-3" />
        </button>
      </div>
      <div className="flex flex-col gap-1 mt-4">
        <NewNoteButton sidebar={effectiveSidebar} />
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                "flex items-center flex-nowrap text-nowrap w-full gap-2 h-8 px-2 text-[14.5px] font-medium rounded-md text-ink-2 transition-[background,color] duration-150",
                isActive
                  ? "bg-gray-200 dark:bg-[#18191D] text-ink font-semibold"
                  : "hover:bg-surface-2 hover:text-ink",
                !effectiveSidebar &&
                  "justify-center px-0 gap-0 h-10.5! w-10.5!",
              )
            }
          >
            <Icon className="shrink-0" size={20} />
            {effectiveSidebar && label}
          </NavLink>
        ))}
      </div>

      <div className="h-px bg-line my-2.5 mx-2" />

      {effectiveSidebar && (
        <div className="flex flex-col gap-0.5 mt-8">
          <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink-3 px-2 pt-1.5 pb-1 mb-1.5">
            Categories
          </div>
          {data?.data?.map((cat) => {
            return (
              <CategoryItem
                key={cat.id}
                cat={cat}
                open={effectiveSidebar}
                onRemove={removeCategory}
                onEdit={handleEditCategory}
              />
            );
          })}

          {effectiveSidebar && (
            <div className="flex items-center gap-2 h-9 px-2 rounded-md text-sm cursor-default group">
              <IconPlus size={20} className="shrink-0 text-ink-2" />
              <input
                className="flex-1 border-0 bg-transparent outline-none text-ink-2 text-[14.5px] font-medium p-0 min-w-0 font-[inherit] placeholder:text-ink-3 placeholder:font-normal"
                placeholder="New category"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") setNewName("");
                }}
              />
            </div>
          )}
        </div>
      )}
    </nav>
  );
});
