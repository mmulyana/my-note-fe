import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { IconDots } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type TodoPriority } from "@/lib/types";
import { TaskMetaPopup } from "@/components/editor/task-meta-popup";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TaskCheckbox({ checked, onChange }: TaskCheckboxProps) {
  return (
    <label className="flex-none cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
      />
      <span
        className={cn(
          "flex items-center justify-center w-touch-checkbox h-touch-checkbox rounded-check border-[1.5px] transition-[background-color,border-color] duration-200",
          checked
            ? "bg-check-on border-check-on-border"
            : "border-check-off-border",
        )}
      >
        <svg
          viewBox="0 0 10 8"
          fill="none"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: "var(--check-mark-w)",
            height: "var(--check-mark-h)",
          }}
        >
          <path
            d="M 1 3.5 L 3.8 6.3 L 9 1"
            stroke="white"
            style={{
              strokeDasharray: 14,
              strokeDashoffset: checked ? 0 : 14,
              transition:
                "stroke-dashoffset 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
      </span>
    </label>
  );
}

interface TaskMetaChange {
  priority?: TodoPriority;
  deadline?: string | null;
}

interface TaskMetaProps {
  checked: boolean;
  priority: TodoPriority;
  deadline: string | null;
  onChange: (attrs: TaskMetaChange) => void;
  onDelete?: () => void;
  /* note: false keeps the chips but drops the dots trigger, for read-only previews */
  showActions?: boolean;
}

export function TaskMeta({
  checked,
  priority,
  deadline,
  onChange,
  onDelete,
  showActions = true,
}: TaskMetaProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="flex-none inline-flex items-center gap-1">
      <TaskDeadline deadline={deadline} checked={checked} />
      {showActions && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid place-items-center w-5.5 h-5.5 flex-none border border-line rounded-md text-ink-3 text-[13px] cursor-pointer transition-[background,color] duration-140 hover:text-ink hover:bg-surface-2"
              title="Task details"
            >
              <IconDots size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-surface border-line-2 rounded-xl shadow-card-lg p-3"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <TaskMetaPopup
              deadline={deadline}
              priority={priority}
              onChange={(attrs) =>
                onChange({
                  priority: attrs.priority,
                  deadline: attrs.deadline,
                })
              }
              onDelete={
                onDelete
                  ? () => {
                      setOpen(false);
                      onDelete();
                    }
                  : undefined
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </span>
  );
}

const DEFAULT_PRIORITY_COLOR = "text-ink-3";

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-500",
  medium: "text-yellow-400",
  low: DEFAULT_PRIORITY_COLOR,
};

const DEFAULT_PRIORITY_BARS = 1;

const PRIORITY_BARS: Record<string, number> = {
  high: 3,
  medium: 2,
  low: DEFAULT_PRIORITY_BARS,
};

export function TaskPriority({ priority }: { priority: TodoPriority }) {
  if (!priority) return null;

  const activeBars = PRIORITY_BARS[priority] ?? DEFAULT_PRIORITY_BARS;
  const activeColor = PRIORITY_COLORS[priority] ?? DEFAULT_PRIORITY_COLOR;

  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="currentColor"
      className="flex-none self-center"
      aria-label={`${priority} priority`}
    >
      <rect
        x="0"
        y="5"
        width="3"
        height="6"
        rx="1.5"
        className={activeBars >= 1 ? activeColor : "text-ink-3/30"}
      />
      <rect
        x="4"
        y="2.5"
        width="3"
        height="8.5"
        rx="1.5"
        className={activeBars >= 2 ? activeColor : "text-ink-3/30"}
      />
      <rect
        x="8"
        y="0"
        width="3"
        height="11"
        rx="1.5"
        className={activeBars >= 3 ? activeColor : "text-ink-3/30"}
      />
    </svg>
  );
}

export function TaskDeadline({
  deadline,
}: {
  deadline: string | null;
  checked: boolean;
}) {
  if (!deadline) return null;

  const parsed = parseISO(deadline);
  const valid = isValid(parsed);

  return (
    <span className="inline-flex h-[18px] items-center rounded-[4px] bg-ink/5 px-1.5 text-[10.5px] font-medium whitespace-nowrap text-[#e06c75]">
      {valid ? format(parsed, "d MMM") : deadline}
    </span>
  );
}
