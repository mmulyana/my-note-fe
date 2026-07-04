import {
  IconDots,
  IconArchive,
  IconLock,
  IconTrash,
  IconLockOpen2,
} from "@tabler/icons-react";
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
        className={`grid place-items-center w-7 h-7 rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-(--surface-hi) hover:text-(--ink) hover:border-(--line-2) outline-none ${className ?? ""}`}
        aria-label="Opsi catatan"
        onClick={(e) => e.stopPropagation()}
      >
        <IconDots size={15} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 bg-(--surface) border-(--line-2) rounded-md shadow-(--shadow-lg) py-1 px-0"
      >
        <DropdownMenuItem
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
          onClick={(e) => {
            e.stopPropagation();
            onArchive?.();
          }}
        >
          <IconArchive size={14} />
          Archive
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2.5 text-[13px] rounded-none cursor-pointer dark:text-white/50"
          onClick={(e) => {
            e.stopPropagation();
            onSecret?.();
          }}
        >
          {secret ? <IconLockOpen2 size={14} /> : <IconLock size={14} />}
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
          <IconTrash size={14} />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
