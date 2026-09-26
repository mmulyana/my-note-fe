import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconCheck,
  IconFolderFilled,
  IconPencil,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import { query } from "@/lib/query";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";

type Folder = { id: string; name: string };

const ICON_BTN =
  "w-6 h-6 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120";
const ICON_BTN_DANGER =
  "w-6 h-6 grid place-items-center rounded-[5px] text-[oklch(0.68_0.17_25)] hover:bg-[color-mix(in_srgb,oklch(0.68_0.17_25)_14%,transparent)] cursor-pointer transition-[color,background] duration-120";

export default function FoldersPage() {
  const queryClient = useQueryClient();

  const { data } = useApi<IApi<Folder[]>>({
    url: urls.Folder,
    queryKey: ["folders"],
  });

  const folders = data?.data ?? [];

  const patchCache = (fn: (prev: Folder[]) => Folder[]) => {
    queryClient.setQueryData(["folders"], (prev: IApi<Folder[]> | undefined) =>
      prev ? { ...prev, data: fn(prev.data ?? []) } : prev,
    );
    queryClient.invalidateQueries({ queryKey: [query.Notes] });
  };

  const removeFolder = async (id: string) => {
    const res = await request<IApi<Folder>>(`${urls.Folder}/${id}`, {
      method: "DELETE",
    });
    if (res.message.includes("deleted")) {
      patchCache((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const editFolder = async (id: string, name: string) => {
    const res = await request<IApi<Folder>>(`${urls.Folder}/${id}`, {
      method: "PATCH",
      body: { name },
    });
    if (res.message.includes("updated")) {
      patchCache((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-4">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h1 className="text-[17px] font-semibold text-ink">Folders</h1>
        <span className="text-sm text-ink-3">
          {folders.length} folder{folders.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
        <NewFolder />
        {folders.length === 0 ? (
          <div className="px-3 py-10 text-center text-[13px] text-ink-3">
            No folders yet. Create one above.
          </div>
        ) : (
          folders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              onRemove={removeFolder}
              onEdit={editFolder}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FolderRow({
  folder,
  onRemove,
  onEdit,
}: {
  folder: Folder;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(folder.name);

  const commit = () => {
    const name = draft.trim();
    if (name && name !== folder.name) onEdit(folder.id, name);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(folder.name);
    setEditing(false);
  };

  return (
    <div className="group flex h-11 items-center gap-2 border-t border-line px-3 text-sm font-medium text-ink-2 transition-colors duration-120 hover:bg-surface-2">
      <IconFolderFilled size={16} className="flex-none text-ink-3" />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-sm text-ink outline-none"
        />
      ) : (
        <Link
          to={`/folder/${folder.id}`}
          className="min-w-0 flex-1 truncate hover:text-ink"
        >
          {folder.name}
        </Link>
      )}

      <div
        className={cn(
          "ml-auto flex flex-none gap-1 transition-opacity duration-120",
          !editing && "opacity-0 group-hover:opacity-100",
        )}
      >
        {editing ? (
          <>
            <button
              type="button"
              title="Save"
              className={ICON_BTN}
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
            >
              <IconCheck size={15} />
            </button>
            <button
              type="button"
              title="Cancel"
              className={ICON_BTN}
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancel}
            >
              <IconX size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              title="Rename"
              className={ICON_BTN}
              onClick={() => {
                setDraft(folder.name);
                setEditing(true);
              }}
            >
              <IconPencil size={15} />
            </button>
            <button
              type="button"
              title="Remove"
              className={ICON_BTN_DANGER}
              onClick={() => onRemove(folder.id)}
            >
              <IconX size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NewFolder() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { mutate: createFolder } = useApi<IApi<Folder>, { name: string }>({
    url: urls.Folder,
    method: "POST",
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["folders"],
        (prev: IApi<Folder[]> | undefined) =>
          prev ? { ...prev, data: [...(prev.data ?? []), res.data] } : res,
      );
    },
  });

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createFolder({ name: trimmed });
    setName("");
  };

  return (
    <div className="flex h-11 items-center gap-2 px-3">
      <IconPlus size={16} className="flex-none text-ink-3" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") add();
          if (e.key === "Escape") setName("");
        }}
        placeholder="New folder"
        className="min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3"
      />
    </div>
  );
}
