import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
  IconFileText,
  IconDots,
  IconLock,
  IconLockOpen2,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/editor/document-card";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import type { DocItem, Folder, IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import { topbarActionsSlotAtom, topbarTitleSlotAtom } from "@/store/topbar";

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const titleSlot = useAtomValue(topbarTitleSlotAtom);
  const actionsSlot = useAtomValue(topbarActionsSlotAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const skipCommitRef = useRef(false);

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
    queryClient.setQueryData(
      ["folder", id],
      (prev: IApi<Folder> | undefined) => (prev ? { ...prev, data } : prev),
    );
    queryClient.setQueryData(
      ["folders"],
      (prev: IApi<Folder[]> | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((f) => (f.id === id ? data : f)),
        };
      },
    );

    let saved = false;
    try {
      await request<IApi<Folder>>(urls.FolderById(id), {
        method: "PATCH",
        body: data,
      });
      saved = true;
    } catch (err) {
      console.warn("Failed to save folder:", err);
    }

    queryClient.invalidateQueries({ queryKey: ["notes"] });
    if (saved) {
      queryClient.invalidateQueries({ queryKey: ["folders", "with-notes"] });
    }
  };

  const togglePin = () => {
    if (!folder) return;
    saveFolder({ ...folder, pinned: !folder.pinned });
  };

  const toggleHide = () => {
    if (!folder) return;
    saveFolder({ ...folder, secret: !folder.secret });
  };

  const toggleIsolate = () => {
    if (!folder) return;
    saveFolder({ ...folder, isolated: !folder.isolated });
  };

  const removeFolder = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await request<IApi<Folder>>(urls.FolderById(id), { method: "DELETE" });
      queryClient.setQueryData(
        ["folders"],
        (prev: IApi<Folder[]> | undefined) =>
          prev ? { ...prev, data: prev.data.filter((f) => f.id !== id) } : prev,
      );
      queryClient.removeQueries({ queryKey: ["folder", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["folders", "with-notes"] });
      setConfirmDelete(false);
      navigate("/");
    } catch (err) {
      console.warn("Failed to delete folder:", err);
    } finally {
      setDeleting(false);
    }
  };

  const startRename = () => {
    if (!folder) return;
    skipCommitRef.current = false;
    setEditName(folder.name);
    setIsEditing(true);
  };

  const commitRename = () => {
    if (!folder || skipCommitRef.current) return;
    skipCommitRef.current = true;
    const name = editName.trim();
    if (name && name !== folder.name) {
      saveFolder({ ...folder, name });
    }
    setIsEditing(false);
  };

  return (
    <>
      {titleSlot &&
        createPortal(
          isEditing ? (
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  skipCommitRef.current = true;
                  setIsEditing(false);
                }
              }}
              className="min-w-0 border-0 bg-transparent p-0 text-[17px] font-semibold text-ink outline-none font-[inherit]"
            />
          ) : (
            <>
              <h1 className="min-w-0 truncate text-[17px] font-semibold text-ink">
                {folder?.name}
              </h1>
              <button
                type="button"
                className="w-7 h-7 flex-none grid place-items-center rounded-lg text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer"
                title="Rename"
                onClick={startRename}
              >
                <IconPencil size={14} />
              </button>
            </>
          ),
          titleSlot,
        )}

      {actionsSlot &&
        createPortal(
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-2 transition-[background,color,transform] duration-150 hover:text-ink active:scale-[0.94] outline-none cursor-pointer"
              aria-label="Folder options"
            >
              <IconDots size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-surface border-line-2 rounded-md shadow-(--shadow-lg) py-1 px-0"
            >
              <DropdownMenuItem
                className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
                onClick={togglePin}
              >
                {folder?.pinned ? (
                  <IconPinnedOff size={14} />
                ) : (
                  <IconPin size={14} />
                )}
                {folder?.pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
                onClick={toggleHide}
              >
                {folder?.secret ? (
                  <IconLockOpen2 size={14} />
                ) : (
                  <IconLock size={14} />
                )}
                {folder?.secret ? "Unhide" : "Hide"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
                onClick={toggleIsolate}
              >
                {folder?.isolated ? (
                  <IconEye size={14} />
                ) : (
                  <IconEyeOff size={14} />
                )}
                {folder?.isolated ? "Show in All" : "Hide from All"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-line" />
              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer"
                onClick={() => setConfirmDelete(true)}
              >
                <IconTrash size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
          actionsSlot,
        )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Delete folder?</DialogTitle>
            <DialogDescription>
              "{folder?.name ?? ""}" will be deleted. Notes inside it are kept
              and will show up in All.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={removeFolder}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {docs.length > 0 ? (
        <div className="masonry grid-view">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-ink-3">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            <IconFileText size={30} />
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            No documents
          </div>
          <div className="text-sm max-w-75">
            No notes in folder "{folder?.name ?? ""}" yet.
          </div>
        </div>
      )}
    </>
  );
}
