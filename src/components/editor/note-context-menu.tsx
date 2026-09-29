import type { ReactNode } from "react";
import {
  ArchiveIcon,
  LockIcon,
  LockOpenIcon,
  TrashIcon,
} from "@/components/icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useNoteActions } from "@/hooks/use-note-actions";
import type { DocItem } from "@/lib/types";

interface NoteContextMenuProps {
  doc: DocItem;
  disabled?: boolean;
  children: ReactNode;
}

const itemClass =
  "flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50";

export function NoteContextMenu({ doc, disabled, children }: NoteContextMenuProps) {
  const { setFlags, remove } = useNoteActions();

  if (disabled) return <>{children}</>;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-40 bg-surface border-line-2 rounded-md shadow-card-lg py-1 px-0">
        <ContextMenuItem
          className={itemClass}
          onSelect={() => setFlags(doc.id, { archived: !doc.archived })}
        >
          <ArchiveIcon className="size-3.5" />
          Archive
        </ContextMenuItem>
        <ContextMenuItem
          className={itemClass}
          onSelect={() => setFlags(doc.id, { secret: !doc.secret })}
        >
          {doc.secret ? (
            <LockOpenIcon className="size-3.5" />
          ) : (
            <LockIcon className="size-3.5" />
          )}
          {doc.secret ? "Open" : "Hide"}
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer"
          onSelect={() => remove(doc.id)}
        >
          <TrashIcon className="size-3.5" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
