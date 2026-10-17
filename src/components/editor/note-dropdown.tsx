import { useState } from "react";
import { IconDots, IconPhoto, IconPlus, IconSubtask } from "@tabler/icons-react";
import {
  ArchiveIcon,
  LabelsIcon,
  LockIcon,
  LockOpenIcon,
  TrashIcon,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderPicker } from "@/components/editor/folder-picker";
import { ThumbnailStyleDialog } from "@/components/editor/thumbnail-style-dialog";
import { MoveToDialog } from "@/components/editor/move-to-dialog";
import type { MoveTarget } from "@/components/editor/session";
import type { CoverStyle } from "@/lib/types";

interface NoteDropdownProps {
  // note: omitted while the note is not saved yet, there is nothing to move
  moveTo?: {
    noteId: string;
    currentParentId?: string | null;
    onMove: (target: MoveTarget | null) => Promise<void>;
  };
  folderLocked?: boolean;
  onAddSubNote?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onSecret?: () => void;
  className?: string;
  secret?: boolean;
  // note: only passed while the note has a thumbnail image
  cover?: { src: string; title: string; style: CoverStyle } | null;
  onCoverStyle?: (style: CoverStyle) => void;
  folderId?: string | null;
  onFolderChange?: (id: string | null) => void;
  labels?: string[];
}

export function NoteDropdown({
  moveTo,
  folderLocked,
  onAddSubNote,
  onDelete,
  onArchive,
  onSecret,
  className,
  secret,
  cover,
  onCoverStyle,
  folderId,
  onFolderChange,
  labels,
}: NoteDropdownProps) {
  const [styleOpen, setStyleOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`grid place-items-center w-7 h-7 max-md:w-10 max-md:h-10 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink data-[state=open]:bg-surface-hi data-[state=open]:text-ink outline-none ${className ?? ""}`}
        aria-label="Note options"
        onClick={(e) => e.stopPropagation()}
      >
        <IconDots size={15} className="max-md:size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 bg-surface border-line-2 rounded-md shadow-card-lg py-1 px-0"
      >
        {onFolderChange && (
          <div className="md:hidden">
            <FolderPicker
              variant="menu"
              selectedId={folderId ?? null}
              onChange={onFolderChange}
              disabled={folderLocked}
            />
          </div>
        )}

        {labels && labels.length > 0 && (
          <div className="md:hidden flex flex-wrap items-center gap-1 px-2 py-1.5">
            {labels.map((name) => (
              <span
                key={name.toLowerCase()}
                className="inline-flex max-w-full items-center gap-0.5 px-1.5 py-0.5 rounded-[8px] text-xs text-ink-2 border border-line"
              >
                <LabelsIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{name}</span>
              </span>
            ))}
          </div>
        )}

        {cover && onCoverStyle && (
          <DropdownMenuItem
            className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
            onClick={(e) => {
              e.stopPropagation();
              setStyleOpen(true);
            }}
          >
            <IconPhoto className="size-3.5" />
            Thumbnail style
          </DropdownMenuItem>
        )}

        {onAddSubNote && (
          <DropdownMenuItem
            className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubNote();
            }}
          >
            <IconPlus className="size-3.5" />
            Add sub-note
          </DropdownMenuItem>
        )}

        {moveTo && (
          <DropdownMenuItem
            className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
            onClick={(e) => {
              e.stopPropagation();
              setMoveOpen(true);
            }}
          >
            <IconSubtask className="size-3.5" />
            Move to…
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
          onClick={(e) => {
            e.stopPropagation();
            onArchive?.();
          }}
        >
          <ArchiveIcon className="size-3.5" />
          Archive
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
          onClick={(e) => {
            e.stopPropagation();
            onSecret?.();
          }}
        >
          {secret ? (
            <LockOpenIcon className="size-3.5" />
          ) : (
            <LockIcon className="size-3.5" />
          )}
          {secret ? "Open" : "Hide"}
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <TrashIcon className="size-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {moveTo && (
      <MoveToDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        noteId={moveTo.noteId}
        currentParentId={moveTo.currentParentId}
        onMove={moveTo.onMove}
      />
    )}

    {cover && onCoverStyle && (
      <ThumbnailStyleDialog
        open={styleOpen}
        onOpenChange={setStyleOpen}
        src={cover.src}
        title={cover.title}
        value={cover.style}
        onChange={onCoverStyle}
      />
    )}
    </>
  );
}
