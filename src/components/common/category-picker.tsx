import { IconTagFilled, IconTag } from "@tabler/icons-react";
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

interface Category {
  id: string;
  name: string;
}

interface CategoryPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryPicker({ selectedIds, onChange }: CategoryPickerProps) {
  const { data } = useApi<IApi<Category[]>>({
    url: urls.Categories,
    queryKey: ["categories"],
  });

  const categories = data?.data ?? [];
  const hasSelection = selectedIds.length > 0;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-1 border-none bg-transparent rounded-[10px] cursor-pointer transition-[background,color,transform] duration-150 active:scale-[0.94] outline-none text-xs text-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        {hasSelection ? (
          <IconTagFilled size={16} className="shrink-0"/>
        ) : (
          <IconTag size={16} className="text-(--ink-2) shrink-0" />
        )}
        Add Tags
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3) px-2 py-1">
          Kategori
        </DropdownMenuLabel>

        {categories.length === 0 ? (
          <p className="px-2 py-1.5 text-[12px] text-(--ink-3)">
            Belum ada kategori
          </p>
        ) : (
          categories.map((cat) => (
            <DropdownMenuCheckboxItem
              key={cat.id}
              checked={selectedIds.includes(cat.id)}
              onCheckedChange={() => toggle(cat.id)}
              onSelect={(e) => e.preventDefault()}
              className="text-[13px] text-(--ink-2) rounded-lg cursor-pointer focus:bg-(--surface-hi) focus:text-(--ink)"
            >
              {cat.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
