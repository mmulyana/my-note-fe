import { type ReactNode } from "react";
import { addDays, format, isValid, parseISO } from "date-fns";
import { type TodoPriority } from "@/lib/types";
import { cn } from "../../lib/utils";
import { IconCalendar, IconFlag, IconTrash } from "@tabler/icons-react";

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

const PRIORITY_DOTS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-ink-3",
};

const QUICK_DEADLINES = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
];

const toISODate = (days: number) =>
  format(addDays(new Date(), days), "yyyy-MM-dd");

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
      <Section icon={<IconFlag size={11} />} label="Priority">
        <div className="grid grid-cols-4 gap-0.5 rounded-lg bg-surface-2 p-0.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={priority === p}
              className={cn(
                "flex h-7 items-center justify-center gap-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer",
                priority === p
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-3 hover:text-ink",
              )}
              onClick={() => onChange({ priority: p })}
            >
              {p && (
                <span
                  className={cn("size-1.5 rounded-full", PRIORITY_DOTS[p])}
                />
              )}
              {p || "None"}
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      <Section
        icon={<IconCalendar size={11} />}
        label="Deadline"
        action={
          deadline && (
            <button
              type="button"
              className="cursor-pointer text-[10px] normal-case tracking-normal text-ink-3 transition-colors hover:text-red-500"
              onClick={() => onChange({ deadline: null })}
            >
              Clear
            </button>
          )
        }
      >
        <div>
          <div className="relative h-9 rounded-lg border border-line bg-surface-2 focus-within:border-accent">
            <div
              className={cn(
                "pointer-events-none flex h-full items-center gap-2 px-2.5 text-[12px]",
                deadlineText ? "text-ink" : "text-ink-3",
              )}
            >
              <IconCalendar size={14} className="flex-none text-ink-3" />
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
        </div>

        <div className="flex gap-1">
          {QUICK_DEADLINES.map(({ label, days }) => {
            const value = toISODate(days);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={deadline === value}
                className={cn(
                  "h-6 flex-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer",
                  deadline === value
                    ? "border-line-2 bg-surface-hi text-ink"
                    : "border-line text-ink-3 hover:text-ink",
                )}
                onClick={() => onChange({ deadline: value })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {onDelete && (
        <>
          <Divider />
          <button
            type="button"
            className="flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md text-[11px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
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

function Divider() {
  return <div className="-mx-3 h-px bg-line" />;
}

function Section({
  icon,
  label,
  action,
  children,
}: {
  icon: ReactNode;
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-4 items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-ink-3">
          {icon}
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}
