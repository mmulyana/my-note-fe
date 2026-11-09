import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SHOCKWAVE_THEMES } from "@/store/shockwave";

const DEFAULT_PAIR = ["#3b82f6", "#10b981"];

export function ShockwaveColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-2">AI wave color</span>
      <div className="grid grid-cols-8 gap-1.5">
        {SHOCKWAVE_THEMES.map((t) => {
          const [a, b] = t.colors ?? DEFAULT_PAIR;
          const selected = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={selected}
              onClick={() => onChange(t.value)}
              style={{ backgroundImage: `linear-gradient(135deg, ${a} 50%, ${b} 50%)` }}
              className={cn(
                "grid size-6 cursor-pointer place-items-center rounded-full text-white outline-none transition-transform duration-120 hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand",
                selected && "ring-2 ring-ink-2 ring-offset-2 ring-offset-surface",
              )}
            >
              {selected && <IconCheck size={12} stroke={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
