import { type ReactNode } from "react";
import { format, isValid, parseISO } from "date-fns";
import { type TodoPriority } from "@/lib/types";
import { cn } from "../../lib/utils";
import { IconTrash } from "@tabler/icons-react";

interface MetaChange {
  deadline?: string | null;
  priority?: TodoPriority;
}

interface TaskMetaPopupProps {
  deadline: string | null;
  priority: TodoPriority;
  onChange: (attrs: MetaChange) => void;
  onDelete?: () => void;
}

const PRIORITIES: TodoPriority[] = ["", "low", "medium", "high"];

const PRIORITY_LABELS: Record<string, string> = {
  "": "None",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const inputClass =
  "text-[13px] font-[inherit] text-ink bg-surface border border-line rounded-[7.5px] px-2.5 h-8 outline-none transition-[border-color,box-shadow] focus:border-line-2 focus:ring-2 focus:ring-line min-w-0 w-full";

export function TaskMetaPopup({
  deadline,
  priority,
  onChange,
  onDelete,
}: TaskMetaPopupProps) {
  const parsed = deadline ? parseISO(deadline) : null;
  const deadlineText = deadline
    ? parsed && isValid(parsed)
      ? format(parsed, "d MMM yyyy")
      : deadline
    : null;

  return (
    <div className="flex flex-col gap-3 text-left">
      <Field label="Priority">
        <select
          value={priority}
          onChange={(e) => onChange({ priority: e.target.value as TodoPriority })}
          className={inputClass}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Deadline">
        <div className="relative">
          <div
            className={cn(
              inputClass,
              "pointer-events-none flex items-center gap-2 text-[13px]",
              deadlineText ? "text-ink" : "text-ink-3",
            )}
          >
            <span className="truncate">{deadlineText ?? "Set deadline"}</span>
          </div>
          <input
            type="date"
            aria-label="Deadline"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none scheme-light dark:scheme-dark"
            value={deadline ?? ""}
            onChange={(e) => onChange({ deadline: e.target.value || null })}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                return;
              }
            }}
          />
        </div>

        {deadline && (
          <button
            type="button"
            className="h-7 w-full cursor-pointer rounded-[7.5px] border border-line text-[11px] font-medium text-ink-3 transition-colors hover:text-red-500"
            onClick={() => onChange({ deadline: null })}
          >
            Clear
          </button>
        )}
      </Field>

      {onDelete && (
        <>
          <div className="-mx-3 h-px bg-line" />
          <button
            type="button"
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[7.5px] text-[11px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
            onClick={onDelete}
          >
            <IconTrash size={13} />
            Delete todo
          </button>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-18 shrink-0 items-center text-[13px] font-medium text-ink-3">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </div>
  );
}
