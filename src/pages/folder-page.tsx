import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconFileText,
  IconDots,
  IconLock,
  IconLockOpen2,
  // IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentCard } from "@/components/editor/document-card";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import type { DocItem, Folder, IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const { data: folderData } = useApi<IApi<Folder>>({
    url: urls.FolderById(id ?? ""),
    queryKey: ["folder", id],
    enabled: !!id,
  });

  const folder = folderData?.data;

  const { data: notesData } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { folderId: id }),
    queryKey: ["notes", { folderId: id }],
    enabled: !!id,
  });

  const docs: DocItem[] = (notesData?.data ?? []).map(toDocItem);

  const saveFolder = async (data: Folder) => {
    if (!id) return;
    await request<IApi<Folder>>(urls.FolderById(id), {
      method: "PATCH",
      body: data,
    });
    queryClient.setQueryData(["folder", id], (prev: IApi<Folder> | undefined) =>
      prev ? { ...prev, data } : prev,
    );
    queryClient.setQueryData(["folders"], (prev: IApi<Folder[]> | undefined) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((f) => (f.id === id ? data : f)),
      };
    });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const toggleHide = () => {
    if (!folder) return;
    saveFolder({ ...folder, secret: !folder.secret });
  };

  const startRename = () => {
    if (!folder) return;
    setEditName(folder.name);
    setIsEditing(true);
  };

  const commitRename = () => {
    if (!folder) return;
    const name = editName.trim();
    if (name && name !== folder.name) {
      saveFolder({ ...folder, name });
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {isEditing ? (
          <>
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="flex-1 min-w-0 text-lg font-semibold text-(--ink) border-0 bg-transparent outline-none p-0 font-[inherit]"
            />
            <button
              type="button"
              className="w-7 h-7 grid place-items-center rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) hover:bg-(--surface-hi) hover:text-(--ink) cursor-pointer"
              title="Save"
              onClick={commitRename}
            >
              <IconCheck size={14} />
            </button>
            <button
              type="button"
              className="w-7 h-7 grid place-items-center rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) hover:bg-(--surface-hi) hover:text-(--ink) cursor-pointer"
              title="Cancel"
              onClick={() => setIsEditing(false)}
            >
              <IconX size={14} />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-(--ink) flex-1 min-w-0 truncate">
              {folder?.name}
            </h1>
            <button
              type="button"
              className="w-7 h-7 grid place-items-center rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) hover:bg-(--surface-hi) hover:text-(--ink) cursor-pointer"
              title="Rename"
              onClick={startRename}
            >
              <IconPencil size={14} />
            </button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="grid place-items-center w-7 h-7 rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-(--surface-hi) hover:text-(--ink) hover:border-(--line-2) outline-none"
            aria-label="Opsi folder"
          >
            <IconDots size={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 bg-(--surface) border-(--line-2) rounded-md shadow-(--shadow-lg) py-1 px-0"
          >
            <DropdownMenuItem
              className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
              onClick={toggleHide}
            >
              {folder?.secret ? <IconLockOpen2 size={14} /> : <IconLock size={14} />}
              {folder?.secret ? "Unhide" : "Hide"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {docs.length > 0 ? (
        <div className="masonry grid-view">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-(--ink-3)">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-(--surface-2) border border-(--line) mb-1.5">
            <IconFileText size={30} />
          </div>
          <div className="text-[17px] font-semibold text-(--ink-2)">
            No documents
          </div>
          <div className="text-sm max-w-75">
            Belum ada catatan di folder "{folder?.name ?? ""}".
          </div>
        </div>
      )}
    </>
  );
}
