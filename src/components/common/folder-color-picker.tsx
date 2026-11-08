import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = [
  { value: "default", label: "Default", hex: "#8b93a1" },
  { value: "#7c5cff", label: "Violet", hex: "#7c5cff" },
  { value: "#3b82f6", label: "Blue", hex: "#3b82f6" },
  { value: "#14b8a6", label: "Teal", hex: "#14b8a6" },
  { value: "#10b981", label: "Green", hex: "#10b981" },
  { value: "#f5b800", label: "Yellow", hex: "#f5b800" },
  { value: "#f97316", label: "Orange", hex: "#f97316" },
  { value: "#ef4444", label: "Red", hex: "#ef4444" },
  { value: "#ec4899", label: "Pink", hex: "#ec4899" },
];

export function FolderColorPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string) => void;
}) {
  const current = value || "default";
  return (
    <div className="px-3 py-2">
      <div className="mb-1.5 text-[11px] font-medium text-ink-3">Color</div>
      <div className="grid grid-cols-5 gap-1.5">
        {FOLDER_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            aria-label={c.label}
            aria-pressed={current === c.value}
            onClick={() => onChange(c.value)}
            style={{ backgroundColor: c.hex }}
            className={cn(
              "grid size-6 cursor-pointer place-items-center rounded-full text-white outline-none transition-transform duration-120 hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand",
              current === c.value && "ring-2 ring-ink-2 ring-offset-2 ring-offset-surface",
            )}
          >
            {current === c.value && <IconCheck size={12} stroke={3} />}
          </button>
        ))}
      </div>
    </div>
  );
}
