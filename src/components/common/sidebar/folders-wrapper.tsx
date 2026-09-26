import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useMatch } from "react-router-dom";
import { useState } from "react";
import {
  IconPencil,
  IconCheck,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { request } from "@/lib/api-client";
import type { Counts, IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { query } from "@/lib/query";
import { FolderIcon } from "@/components/icons";

type Props = {
  sidebar: boolean;
};
export default function FoldersWrapper({ sidebar }: Props) {
  const queryClient = useQueryClient();

  const { data } = useApi<IApi<any[]>>({
    url: urls.Folder,
    queryKey: ["folders"],
  });

  const { data: counts } = useApi<IApi<Counts>>({
    url: urls.NotesCounts,
    queryKey: ["notes", "counts"],
  });

  const handleEditFolder = async (id: string, name: string) => {
    const response = await request<IApi<any>>(`${urls.Folder}/${id}`, {
      method: "PATCH",
      body: {
        name,
      },
    });
    if (response.message.includes("updated")) {
      queryClient.setQueryData(["folders"], (prev: IApi<any[]> | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((c) => (c.id === id ? { ...c, name } : c)),
        };
      });
    }
    queryClient.invalidateQueries({ queryKey: [query.Notes] });
  };

  if (!sidebar) return null;

  return (
    <>
      <div className="flex flex-col gap-0.5 mt-5">
        <div className="text-sm text-ink-3 px-2 font-medium">Folders</div>
        <div className="h-fit max-h-96 overflow-y-auto">
          {data?.data?.map((data) => {
            return (
              <ListItem
                key={data.id}
                data={data}
                count={counts?.data?.folders?.[data.id] ?? 0}
                open={sidebar}
                onEdit={handleEditFolder}
              />
            );
          })}
        </div>
        <NewFolder />
      </div>
    </>
  );
}

type ListProps = {
  data: any;
  count: number;
  open: boolean;
  onEdit: (id: string, name: string) => void;
};

function ListItem({ data, count, open, onEdit }: ListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const isActive = !!useMatch({ path: `/folder/${data.id}`, end: true });

  const handleEdit = () => {
    if (editName.trim()) {
      onEdit(data.id, editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center h-8 px-2 rounded-full text-sm font-medium transition-[background,color] duration-150 group",
        open ? "gap-2" : "justify-center gap-0",
        isActive ? "text-ink font-semibold bg-line/60" : "text-ink-3",
        isEditing && "bg-line/90",
      )}
    >
      {!isEditing ? (
        <NavLink
          to={`/folder/${data.id}`}
          className="flex items-center gap-2 flex-1 min-w-0 h-full"
        >
          <div className="w-4.5 h-4.5 flex-none flex justify-center items-center">
            <FolderIcon />
          </div>
          {open && (
            <span className="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {data.name}
            </span>
          )}
        </NavLink>
      ) : (
        <>
          <div className="w-4.5 h-4.5 flex justify-center items-center">
            <FolderIcon />
          </div>
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="flex-1 border-0 bg-transparent outline-none text-ink-2 text-[14.5px] font-medium p-0 min-w-0 font-[inherit]"
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}

      {open && (
        <>
          <div className="flex-none flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120 ml-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="w-5 h-5 grid place-items-center rounded-[4px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                  title="Save"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <IconCheck size={14} />
                </button>
                <button
                  type="button"
                  className="w-5 h-5 grid place-items-center rounded-[4px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer duration-120"
                  title="Cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditName(data.name);
                  }}
                >
                  <IconX size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="w-5 h-5 grid place-items-center rounded-[4px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsEditing(true);
                  }}
                >
                  <IconPencil size={14} />
                </button>
              </>
            )}
          </div>
          {open && count > 0 && (
            <span className="text-xs font-normal text-ink-3 tabular-num mr-2">
              {count}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function NewFolder() {
  const queryClient = useQueryClient();

  const [newName, setNewName] = useState("");

  const { mutate: createFolder } = useApi<IApi<any>, Partial<any>>({
    url: urls.Folder,
    method: "POST",
    onSuccess: (res) => {
      queryClient.setQueryData(["folders"], (prev: IApi<any[]> | undefined) => {
        if (!prev) return res;
        return {
          ...prev,
          data: [...(prev.data || []), res.data],
        };
      });
    },
  });

  const addFolder = () => {
    const name = newName.trim();
    if (!name) return;
    createFolder({ name });
    setNewName("");
  };
  return (
    <div className="flex items-center gap-2 h-8 px-2 rounded-md text-sm cursor-default group">
      <div className="w-4.5 h-4.5 flex justify-center items-center">
        <IconPlus size={16} className="shrink-0 text-ink-2" />
      </div>
      <input
        className="flex-1 border-0 bg-transparent outline-none text-ink-2 text-[14.5px] font-medium p-0 min-w-0 font-[inherit] placeholder:text-ink-3 placeholder:font-normal"
        placeholder="New folder"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addFolder();
          if (e.key === "Escape") setNewName("");
        }}
      />
    </div>
  );
}
