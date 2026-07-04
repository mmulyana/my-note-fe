import { IconFolderFilled } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Folder {
  id: string;
  name: string;
}

interface FolderPickerProps {
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function FolderPicker({ selectedId, onChange }: FolderPickerProps) {
  const { data } = useApi<IApi<Folder[]>>({
    url: urls.Folder,
    queryKey: ["folders"],
  });

  const folders = data?.data ?? [];
  const selected = folders.find((f) => f.id === selectedId);

  const toggle = (id: string) => {
    onChange(selectedId === id ? null : id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-1 rounded-[10px] border border-(--line) bg-(--surface) hover:bg-accent text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-surface-hi hover:text-ink hover:border-(--line-2) outline-none disabled:opacity-40 disabled:pointer-events-none px-2.5 text-xs hover:cursor-pointer"
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

        {folders.length === 0 ? (
          <p className="px-2 py-1.5 text-[12px] text-(--ink-3)">
            Belum ada folder
          </p>
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
