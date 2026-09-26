import {
  NodeViewContent,
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { IconDots } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { type TodoPriority } from "@/lib/types";
import { TaskDeadline, TaskPriority } from "./task-checkbox";

import { TaskMetaPopup } from "./task-meta-popup";

export function TaskItemView({ node, updateAttributes }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);

  const checked = Boolean(node.attrs.checked);
  const deadline: string | null = node.attrs.deadline ?? null;
  const today: string | null = node.attrs.today ?? null;
  const priority: TodoPriority = (node.attrs.priority as TodoPriority) ?? "";

  return (
    <NodeViewWrapper
      as="li"
      data-type="taskItem"
      data-checked={checked}
      data-deadline={deadline ?? undefined}
      data-today={today ?? undefined}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-start flex-1 min-w-0">
          <label
            contentEditable={false}
            className="flex-none cursor-pointer select-none mt-[0.15em]"
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
                "flex items-center justify-center w-touch-checkbox h-touch-checkbox rounded-(--check-radius) border-[1.5px] transition-[background-color,border-color] duration-200",
                checked
                  ? "bg-(--check-on-bg) border-(--check-on-border)"
                  : "border-(--check-off-border)",
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

          <TaskPriority priority={priority} />
          <NodeViewContent as="div" className="flex-1 min-w-0" />
        </div>

        <span
          className="flex-none inline-flex items-center gap-1 mt-[0.05em]"
          contentEditable={false}
        >
          <TaskDeadline deadline={deadline} checked={checked} />
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="grid place-items-center w-5.5 h-5.5 flex-none rounded-md text-ink-3 text-[13px] cursor-pointer transition-[background,color] duration-140 hover:text-(--ink) hover:bg-surface-2"
                title="Task details"
              >
                <IconDots size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 bg-surface border-line-2 rounded-xl shadow-lg p-3"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <TaskMetaPopup
                deadline={deadline}
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
