import { IconTagFilled, IconPlus } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Label {
  id: string;
  name: string;
}

interface LabelPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  variant?: "button" | "menu";
}

export function LabelPicker({
  selectedIds,
  onChange,
  variant = "button",
}: LabelPickerProps) {
  const { data } = useApi<IApi<Label[]>>({
    url: urls.Labels,
    queryKey: ["labels"],
  });

  const labels = data?.data ?? [];

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const items =
    labels.length === 0 ? (
      <p className="px-2 py-1.5 text-[12px] text-(--ink-3)">Belum ada label</p>
    ) : (
      labels.map((cat) => (
        <DropdownMenuCheckboxItem
          key={cat.id}
          checked={selectedIds.includes(cat.id)}
          onCheckedChange={() => toggle(cat.id)}
          onSelect={(e) => e.preventDefault()}
          className="text-[13px] text-(--ink-2) cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          {cat.name}
        </DropdownMenuCheckboxItem>
      ))
    );

  if (variant === "menu") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="text-xs text-(--ink-2) rounded-none cursor-pointer">
          <IconTagFilled size={14} className="text-(--ink-3)" />
          Label
          {selectedIds.length > 0 && (
            <span className="ml-auto text-[11px] font-semibold text-(--ink-2)">
              {selectedIds.length}
            </span>
          )}
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
        className="inline-flex h-touch-picker-h items-center justify-center gap-1 rounded-[10px] border border-(--line) bg-(--surface) hover:bg-accent text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-surface-hi hover:text-ink hover:border-(--line-2) outline-none disabled:opacity-40 disabled:pointer-events-none px-touch-picker-px text-xs hover:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <IconPlus size={16} className="shrink-0" />
        Add Label
        {selectedIds.length > 0 && (
          <>
            <div className="h-4 w-px bg-gray-200"></div>
            <IconTagFilled size={12} className="text-(--ink-2) shrink-0" />
            <span className="font-semibold">{selectedIds.length}</span>
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3) px-2 py-1">
          Label
        </DropdownMenuLabel>
        {items}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
