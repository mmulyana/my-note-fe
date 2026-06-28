import { type ReactNode } from "react";
import { type TodoPriority } from "@/lib/types";
import { cn } from "../../lib/utils";
import { IconX } from "@tabler/icons-react";

interface MetaChange {
  deadline?: string | null;
  priority?: TodoPriority;
}

interface TaskMetaPopupProps {
  deadline: string | null;
  priority: TodoPriority;
  onChange: (attrs: MetaChange) => void;
}

const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];

export function TaskMetaPopup({
  deadline,
  priority,
  onChange,
}: TaskMetaPopupProps) {
  return (
    <div className="flex flex-col gap-2.75 text-left">
      <Field label="Priority">
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={cn(
                "flex-1 h-7 rounded-md text-[11px] font-medium capitalize border transition-colors",
                priority === p
                  ? "bg-(--surface-hi) text-(--ink) border-(--line-2)"
                  : "text-(--ink-3) border-(--line) hover:text-(--ink)",
              )}
              onClick={() => onChange({ priority: p })}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Deadline">
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            className="text-[12px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[7px] px-2 py-1.25 outline-none scheme-light dark:scheme-dark focus:border-accent flex-1"
            value={deadline ?? ""}
            onChange={(e) => onChange({ deadline: e.target.value || null })}
          />
          {deadline && (
            <button
              type="button"
              className="grid place-items-center w-5.5 h-5.5 flex-none border border-(--line) bg-(--surface-hi) rounded-md text-(--ink-3) text-[13px] cursor-pointer transition-[background,color] duration-140 hover:text-(--ink) hover:bg-(--surface-2)"
              title="Clear deadline"
              onClick={() => onChange({ deadline: null })}
            >
              <IconX size={15} />
            </button>
          )}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3)">
        {label}
      </span>
      {children}
    </div>
  );
}
