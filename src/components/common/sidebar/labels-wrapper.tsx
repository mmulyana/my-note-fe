import { useQueryClient } from "@tanstack/react-query";
import {
  IconCheck,
  IconHash,
  IconPencil,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { request } from "@/lib/api-client";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { query } from "@/lib/query";

type Props = {
  sidebar: boolean;
};
export default function LabelsWrapper({ sidebar }: Props) {
  const queryClient = useQueryClient();

  const { data } = useApi<IApi<any[]>>({
    url: urls.Labels,
    queryKey: ["labels"],
  });

  const removeLabel = async (id: string) => {
    const response = await request<IApi<any>>(`${urls.Labels}/${id}`, {
      method: "DELETE",
    });
    if (response.message.includes("deleted")) {
      queryClient.setQueryData(["labels"], (prev: IApi<any[]> | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.filter((c) => c.id !== id),
        };
      });
    }
    queryClient.invalidateQueries({ queryKey: [query.Notes] });
  };

  const handleEditLabel = async (id: string, name: string) => {
    const response = await request<IApi<any>>(`${urls.Labels}/${id}`, {
      method: "PATCH",
      body: {
        name,
      },
    });
    if (response.message.includes("updated")) {
      queryClient.setQueryData(["labels"], (prev: IApi<any[]> | undefined) => {
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
        <div className="text-xs text-(--ink-3) px-2 font-medium">Labels</div>
        <div className="max-h-24 overflow-y-auto">
          {data?.data?.map((data) => {
            return (
              <ListItem
                key={data.id}
                data={data}
                open={sidebar}
                onRemove={removeLabel}
                onEdit={handleEditLabel}
              />
            );
          })}
        </div>
        <NewLabel />
      </div>
    </>
  );
}

type ListProps = {
  data: any;
  open: boolean;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
};

function ListItem({ data, open, onRemove, onEdit }: ListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.name);

  const handleEdit = () => {
    if (editName.trim()) {
      onEdit(data.id, editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center h-9 px-2 rounded-md text-sm font-medium text-ink-2 transition-[background,color] duration-150 group",
        open ? "gap-2" : "justify-center gap-0 px-0",
      )}
    >
      {!isEditing ? (
        <Link
          to={`/label/${encodeURIComponent(data.name)}`}
          className="flex items-center gap-2 flex-1 min-w-0 h-full"
        >
          <div className="w-5 h-5 flex justify-center items-center">
            <IconHash size={16} className="shrink-0" />
          </div>
          {open && (
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {data.name}
            </span>
          )}
        </Link>
      ) : (
        <>
          <div className="w-5 h-5 flex justify-center items-center">
            <IconHash size={16} className="shrink-0" />
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
        <div className="flex-none flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120 ml-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
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
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
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
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                <IconPencil size={14} />
              </button>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-[oklch(0.68_0.17_25)] hover:bg-[color-mix(in_srgb,oklch(0.68_0.17_25)_14%,transparent)] cursor-pointer transition-[color,background] duration-120"
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(data.id);
                }}
              >
                <IconX size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NewLabel() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const { mutate: createLabel } = useApi<IApi<any>, Partial<any>>({
    url: urls.Labels,
    method: "POST",
    onSuccess: (res) => {
      queryClient.setQueryData(["labels"], (prev: IApi<any[]> | undefined) => {
        if (!prev) return res;
        return {
          ...prev,
          data: [...(prev.data || []), res.data],
        };
      });
    },
  });

  const addLabel = () => {
    const name = newName.trim();
    if (!name) return;
    createLabel({ name });
    setNewName("");
  };

  return (
    <div className="flex items-center gap-2 h-9 px-2 rounded-md text-sm cursor-default group mt-1">
      <div className="w-5 h-5 flex justify-center items-center">
        <IconPlus size={16} className="shrink-0 text-ink-2" />
      </div>
      <input
        className="flex-1 border-0 bg-transparent outline-none text-ink-2 text-[14.5px] font-medium p-0 min-w-0 font-[inherit] placeholder:text-ink-3 placeholder:font-normal"
        placeholder="New label"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addLabel();
          if (e.key === "Escape") setNewName("");
        }}
      />
    </div>
  );
}
