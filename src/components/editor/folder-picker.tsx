import { IconFolderFilled } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";

interface Folder {
  id: string;
  name: string;
}

interface FolderPickerProps {
  selectedId: string | null;
  onChange: (id: string | null) => void;
  variant?: "button" | "menu";
}

export function FolderPicker({
  selectedId,
  onChange,
  variant = "button",
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

  const items =
    folders.length === 0 ? (
      <p className="px-2 py-1.5 text-[12px] text-(--ink-3)">Belum ada folder</p>
    ) : (
      folders.map((folder) => (
        <DropdownMenuCheckboxItem
          key={folder.id}
          checked={selectedId === folder.id}
          onCheckedChange={() => toggle(folder.id)}
          onSelect={(e) => e.preventDefault()}
          className="text-[13px] text-(--ink-2) rounded-lg cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          {folder.name}
        </DropdownMenuCheckboxItem>
      ))
    );

  if (variant === "menu") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-[13px] text-(--ink-2) rounded-none cursor-pointer">
          <IconFolderFilled size={14} className="text-(--ink-3)" />
          {selected ? selected.name : "Folder"}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-44 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-1">
          {items}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center h-touch-picker-h justify-center gap-1 rounded-[10px] border border-line bg-surface hover:bg-accent text-ink-3 transition-[background,color,border-color] duration-150 hover:bg-surface-hi hover:text-ink hover:border-line-2 outline-none disabled:opacity-40 disabled:pointer-events-none px-touch-picker-px text-xs hover:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <IconFolderFilled size={16} className="shrink-0" />
        {selected ? selected.name : "Add Folder"}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3) px-2 py-1">
          Folder
        </DropdownMenuLabel>
        {items}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
