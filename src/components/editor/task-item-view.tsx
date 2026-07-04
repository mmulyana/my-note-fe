import {
  NodeViewContent,
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { isBefore, isValid, parseISO, startOfDay } from "date-fns";
import { IconDots } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { type TodoPriority } from "@/lib/types";

import { TaskMetaPopup } from "./task-meta-popup";

const chipBase =
  "inline-flex items-center gap-[3px] h-[18px] px-1.5 text-[10.5px] font-medium leading-none rounded-md whitespace-nowrap border border-(--line) text-(--ink-3)";
const chipHigh =
  "text-[#e06c75] border-[color-mix(in_srgb,#e06c75_45%,transparent)]";
const chipToday =
  "text-(--accent) border-[color-mix(in_srgb,var(--accent)_45%,transparent)]";

export function TaskItemView({ node, updateAttributes }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);

  const checked = Boolean(node.attrs.checked);
  const deadline: string | null = node.attrs.deadline ?? null;
  const today: string | null = node.attrs.today ?? null;
  const priority: TodoPriority =
    (node.attrs.priority as TodoPriority) ?? "low";

  const parsed = deadline ? parseISO(deadline) : null;
  const valid = parsed != null && isValid(parsed);
  const overdue = valid && !checked && isBefore(parsed, startOfDay(new Date()));

  return (
    <NodeViewWrapper
      as="li"
      data-type="taskItem"
      data-checked={checked}
      data-deadline={deadline ?? undefined}
      data-today={today ?? undefined}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <label
            contentEditable={false}
            className="flex-none cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => updateAttributes({ checked: e.target.checked })}
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
                "flex items-center justify-center w-3.75 h-3.75 rounded border-[1.5px] transition-[background-color,border-color] duration-200",
                checked
                  ? "bg-blue-500 border-blue-500"
                  : "bg-gray-200 border-gray-200",
              )}
            >
              <svg
                viewBox="0 0 10 8"
                fill="none"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 9, height: 7 }}
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

          <NodeViewContent as="div" />
        </div>

        <span
          className="flex-none inline-flex items-center gap-1 mt-[0.05em]"
          contentEditable={false}
        >
          {priority === "medium" && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="currentColor"
              className="text-yellow-400"
            >
              <rect x="0" y="5" width="3" height="6" rx="1.5" />
              <rect x="4.5" y="2" width="3" height="9" rx="1.5" />
            </svg>
          )}
          {priority === "high" && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="currentColor"
              className="text-red-500"
            >
              <rect x="0" y="5" width="3" height="6" rx="1.5" />
              <rect x="4" y="2.5" width="3" height="8.5" rx="1.5" />
              <rect x="8" y="0" width="3" height="11" rx="1.5" />
            </svg>
          )}
          {deadline && (
            <span className={cn(chipBase, overdue && chipHigh)}>
              {deadline}
            </span>
          )}
          {today && <span className={cn(chipBase, chipToday)}>Today</span>}

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="grid place-items-center w-5.5 h-5.5 flex-none border border-(--line) rounded-md text-(--ink-3) text-[13px] cursor-pointer transition-[background,color] duration-140 hover:text-(--ink) hover:bg-(--surface-2)"
                title="Task details"
              >
                <IconDots size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-3"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <TaskMetaPopup
                deadline={deadline}
                today={today}
                priority={priority}
                // [tags disabled] re-enable: pass tags={tags}
                onChange={(attrs) => updateAttributes(attrs)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>
    </NodeViewWrapper>
  );
}
