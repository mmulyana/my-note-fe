import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
} from "date-fns";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import type { IApi, Todo, TodoDateGroup } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { TaskCheckbox, TaskMeta } from "@/components/editor/task-checkbox";
import { TodoProgress } from "@/components/editor/todo-progress";
import { Button } from "@/components/ui/button";

type UpdatePayload = { id: string } & Partial<
  Pick<Todo, "text" | "checked" | "deadline" | "priority">
>;

const NAV_BTN =
  "rounded-md text-ink-3 hover:text-ink hover:bg-black/6 dark:hover:text-white dark:hover:bg-white/10 h-[32px]";

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const ISO = "yyyy-MM-dd";

// note: group heading; today/yesterday get a name, other days a full date
function dateLabel(date: string) {
  const d = parseISO(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

export default function TodosPage() {
  const queryClient = useQueryClient();

  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(new Date()),
  );

  const from = format(startOfMonth(monthCursor), ISO);
  const to = format(endOfMonth(monthCursor), ISO);

  const { data, isLoading } = useApi<IApi<TodoDateGroup[]>>({
    url: urls.TodosGroupedByDate(from, to, TZ),
    queryKey: ["todos-by-date", from, to],
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["todos-by-date"] });

  const { mutate: updateTodo } = useMutation({
    mutationFn: ({ id, ...body }: UpdatePayload) =>
      request(urls.Todo(id), { method: "PATCH", body }),
    onSuccess: invalidate,
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: (id: string) => request(urls.Todo(id), { method: "DELETE" }),
    onSuccess: invalidate,
  });

  // note: newest day first, days without todos are omitted
  const groups = useMemo(
    () =>
      [...(data?.data ?? [])]
        .filter((group) => group.todos.length > 0)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  return (
    <div className="pb-4 pt-[3px]">
      <div className="mb-6 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Previous month"
          aria-label="Previous month"
          className={NAV_BTN}
          onClick={() => setMonthCursor((m) => addMonths(m, -1))}
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Next month"
          aria-label="Next month"
          className={NAV_BTN}
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
        >
          <IconChevronRight />
        </Button>
        <p className="ml-3 truncate text-xl font-semibold flex gap-1">
          {format(monthCursor, "MMMM")}
          <span className="opacity-40">{format(monthCursor, "yyyy")}</span>
        </p>
        {!isSameMonth(monthCursor, new Date()) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMonthCursor(startOfMonth(new Date()))}
            className={cn(NAV_BTN, "ml-1 h-fit py-0.5 px-1.5 w-fit text-sm")}
          >
            Today
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">Loading...</div>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">No todos this month.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <TodoGroup
              key={group.date}
              group={group}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TodoGroup({
  group,
  onUpdate,
  onDelete,
}: {
  group: TodoDateGroup;
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
}) {
  const done = group.todos.filter((t) => t.checked).length;

  return (
    <section>
      <div className="mb-1 flex items-center gap-2 border-b border-line pb-2">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {dateLabel(group.date)}
        </h2>
        <TodoProgress done={done} total={group.todos.length} />
      </div>
      <div className="flex flex-col">
        {group.todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function TodoItem({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(todo.text);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate({ id: todo.id, text: trimmed });
    } else {
      setDraft(todo.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(todo.text);
      setEditing(false);
    }
  };

  return (
    <div className="shrink-0 flex items-center gap-2.5 py-1 transition-colors duration-120 hover:bg-surface-2">
      <TaskCheckbox
        checked={todo.checked}
        onChange={(checked) => onUpdate({ id: todo.id, checked })}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="text-sm flex-1 min-w-0 leading-snug bg-transparent outline-none border-b border-line focus:border-ink transition-colors duration-120"
        />
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "text-sm flex-1 min-w-0 leading-snug cursor-text break-words",
            todo.checked && "line-through text-ink-3",
          )}
        >
          {todo.text}
        </span>
      )}
      <TaskMeta
        checked={todo.checked}
        priority={todo.priority}
        deadline={todo.deadline}
        onChange={(attrs) => onUpdate({ id: todo.id, ...attrs })}
        onDelete={() => onDelete(todo.id)}
      />
    </div>
  );
}
