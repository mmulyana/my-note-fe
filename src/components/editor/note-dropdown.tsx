import { IconDots } from "@tabler/icons-react";
import {
  ArchiveIcon,
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

interface NoteDropdownProps {
  onDelete?: () => void;
  onArchive?: () => void;
  onSecret?: () => void;
  className?: string;
  secret?: boolean;
}

export function NoteDropdown({
  onDelete,
  onArchive,
  onSecret,
  className,
  secret,
}: NoteDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink data-[state=open]:bg-surface-hi data-[state=open]:text-ink outline-none ${className ?? ""}`}
        aria-label="Note options"
        onClick={(e) => e.stopPropagation()}
      >
        <IconDots size={15} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 bg-surface border-line-2 rounded-md shadow-card-lg py-1 px-0"
      >
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
  );
}
