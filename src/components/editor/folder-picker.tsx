import { IconChevronRight } from "@tabler/icons-react";
import { FolderIcon } from "@/components/icons";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { IApi } from "@/lib/types";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";

interface Folder {
  id: string;
  name: string;
}

interface FolderPickerProps {
  selectedId: string | null;
  onChange: (id: string | null) => void;
  variant?: "button" | "list" | "trigger";
  // note: a sub-note always follows its parent's folder
  disabled?: boolean;
  // note: "trigger" only, called instead of onChange since it just opens the list panel
  onRequestOpen?: () => void;
}

export function FolderPicker({
  selectedId,
  onChange,
  variant = "button",
  disabled = false,
  onRequestOpen,
}: FolderPickerProps) {
  const { data } = useApi<IApi<Folder[]>>({
    url: urls.Folder,
    queryKey: ["folders"],
  });

  const folders = data?.data ?? [];
  const selected = folders.find((f) => f.id === selectedId);

  const toggle = (id: string) => {
    onChange(selectedId === id ? null : id);
  };

  const itemRounded = variant === "list" ? "rounded-none" : "rounded-lg";

  const items =
    folders.length === 0 ? (
      <p className="px-2 py-1.5 text-[12px] text-ink-3">No folders yet</p>
    ) : (
      folders.map((folder) => (
        <DropdownMenuCheckboxItem
          key={folder.id}
          checked={selectedId === folder.id}
          onCheckedChange={() => toggle(folder.id)}
          onSelect={(e) => e.preventDefault()}
          className={cn(
            "text-[13px] text-ink-2 cursor-pointer focus:bg-accent focus:text-accent-foreground",
            itemRounded,
          )}
        >
          {folder.name}
        </DropdownMenuCheckboxItem>
      ))
    );

  if (variant === "list") {
    return items;
  }

  if (variant === "trigger") {
    return (
      <button
        type="button"
        disabled={disabled}
        title={disabled ? "Follows the parent note's folder" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onRequestOpen?.();
        }}
        className="flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm outline-hidden select-none hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50"
      >
        <FolderIcon className="size-3.5 shrink-0 text-ink-3" />
        <span className="truncate">{selected ? selected.name : "Folder"}</span>
        <IconChevronRight className="ml-auto size-3.5 shrink-0 text-ink-3" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        title={disabled ? "Follows the parent note's folder" : undefined}
        className="inline-flex items-center h-7 justify-center gap-1 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink data-[state=open]:bg-surface-hi data-[state=open]:text-ink outline-none disabled:opacity-40 disabled:pointer-events-none px-1.5 text-xs hover:cursor-pointer max-lg:px-0"
        onClick={(e) => e.stopPropagation()}
      >
        <FolderIcon className="size-4 shrink-0" />
        {selected ? selected.name : "Add Folder"}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-44 bg-surface border-line-2 rounded-xl shadow-card-lg p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-ink-3 px-2 py-1">
          Folder
        </DropdownMenuLabel>
        {items}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
