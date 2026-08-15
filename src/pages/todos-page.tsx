import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  IconPlus,
  IconChevronDown,
  IconArrowRight,
  IconX,
} from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { request } from "@/lib/api-client";
import type { IApi, Todo, TodoGroup, TodoTodayGroups, TodoView } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn, newId } from "@/lib/utils";
import { TaskCheckbox, TaskMeta } from "@/components/editor/task-checkbox";
import { TodoProgress } from "@/components/editor/todo-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpdatePayload = { id: string } & Partial<
  Pick<Todo, "text" | "checked" | "deadline" | "priority" | "today">
>;

type CreatePayload = {
  id: string;
  noteId: string;
  text: string;
  lastTodoId?: string;
};

type AddTarget = {
  noteId: string;
  lastTodoId?: string;
  onCreate: (payload: CreatePayload) => void;
};

const CIRCLE_BTN =
  "grid h-7 w-7 flex-none place-items-center rounded-full bg-(--ink) text-(--surface) cursor-pointer outline-none transition-opacity duration-140 hover:opacity-85";

const TODAY_SECTIONS: { key: keyof TodoTodayGroups; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

const GRID = "masonry grid-view";

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useLocalStorage<TodoView>("todos-view", "all");
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const { data: groupedData, isLoading: loadingAll } = useApi<IApi<TodoGroup[]>>({
    url: urls.TodosGrouped,
    queryKey: ["todos-grouped"],
    enabled: view === "all",
  });

  const { data: todayData, isLoading: loadingToday } = useApi<IApi<TodoTodayGroups>>({
    url: urls.TodosGroupedToday(todayDate),
    queryKey: ["todos-grouped-today", todayDate],
    enabled: view === "today",
  });

  const { mutate: updateTodo } = useMutation({
    mutationFn: ({ id, ...body }: UpdatePayload) =>
      request(urls.Todo(id), { method: "PATCH", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
    },
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: (id: string) => request(urls.Todo(id), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
    },
  });

  const { mutate: createTodo } = useMutation({
    mutationFn: (body: {
      id: string;
      noteId: string;
      text: string;
      lastTodoId?: string;
    }) => request(urls.Todos, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const groups = groupedData?.data ?? [];
  const todayGroups = todayData?.data;
  const totalTodos = groups.reduce((acc, g) => acc + g.todos.length, 0);
  const isLoading = view === "all" ? loadingAll : loadingToday;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-3">
          {view === "all"
            ? `${totalTodos} todo${totalTodos === 1 ? "" : "s"}`
            : format(new Date(), "EEEE, MMM d")}
        </p>
        <ViewDropdown view={view} onChange={setView} />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">Loading...</div>
        </div>
      ) : view === "all" ? (
        groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={GRID}>
            {groups.map((group) => (
              <TodoCard
                key={group.noteId}
                title={group.title ?? "Untitled"}
                todos={group.todos}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                add={{
                  noteId: group.noteId,
                  lastTodoId:
                    group.todos.length > 0
                      ? group.todos[group.todos.length - 1].id
                      : undefined,
                  onCreate: createTodo,
                }}
              />
            ))}
          </div>
        )
      ) : !todayGroups ||
        TODAY_SECTIONS.every((s) => todayGroups[s.key].length === 0) ? (
        <EmptyState />
      ) : (
        <div className={GRID}>
          {TODAY_SECTIONS.map(
            ({ key, label }) =>
              todayGroups[key].length > 0 && (
                <TodoCard
                  key={key}
                  title={label}
                  todos={todayGroups[key]}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              ),
          )}
        </div>
      )}
    </div>
  );
}

function TodoCard({
  title,
  todos,
  onUpdate,
  onDelete,
  add,
}: {
  title: string;
  todos: Todo[];
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
  add?: AddTarget;
}) {
  const [open, setOpen] = useState(false);
  const done = todos.filter((t) => t.checked).length;

  return (
    <>
      <section
        className="flex flex-col rounded-[14px] border border-line bg-surface text-ink overflow-hidden cursor-pointer outline-none transition-[box-shadow,border-color] duration-150 hover:border-line-2 hover:shadow-(--shadow) focus-visible:shadow-[0_0_0_2px_var(--accent)]"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        <div className="shrink-0 px-3 pt-2.5">
          <div className="w-fit">
            <TodoProgress done={done} total={todos.length} />
          </div>
          <p className="mt-1.5 text-sm font-semibold truncate">{title}</p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-3 pt-1.5 overflow-hidden pointer-events-none mask-[linear-gradient(to_bottom,black_80%,transparent)]">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showActions={false}
            />
          ))}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-line bg-surface-2"
        >
          {add ? (
            <AddTodo {...add} />
          ) : (
            <span className="flex-1 min-w-0 text-[13px] text-ink-3">
              {todos.length} task{todos.length === 1 ? "" : "s"}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={CIRCLE_BTN}
            title="Open"
            aria-label="Open"
          >
            <IconArrowRight size={15} />
          </button>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-lg gap-0 p-0 overflow-hidden"
        >
          <DialogHeader className="gap-1.5 px-4 pt-3.5">
            <div className="flex items-center gap-2">
              <TodoProgress done={done} total={todos.length} />
              <DialogClose
                className="ml-auto grid h-7 w-7 flex-none place-items-center rounded-full bg-surface-hi text-ink-3 outline-none cursor-pointer transition-colors duration-140 hover:text-ink"
                aria-label="Close"
              >
                <IconX size={15} />
              </DialogClose>
            </div>
            <DialogTitle className="truncate">{title}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col max-h-[60vh] overflow-y-auto px-4 pt-2 pb-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={onUpdate}
                onDelete={onDelete}
                showActions
              />
            ))}
          </div>

          {add && (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-line bg-surface-2">
              <AddTodo {...add} showSubmit />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ViewDropdown({
  view,
  onChange,
}: {
  view: TodoView;
  onChange: (view: TodoView) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-(--line) bg-(--surface) text-[13px] text-(--ink-2) transition-colors duration-120 hover:bg-(--surface-2) outline-none">
        {view === "all" ? "All notes" : "Today"}
        <IconChevronDown size={14} className="text-ink-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-(--surface) border-(--line-2) rounded-md shadow-(--shadow-lg) py-1 px-0"
      >
        <DropdownMenuRadioGroup
          value={view}
          onValueChange={(v) => onChange(v as TodoView)}
        >
          <DropdownMenuRadioItem
            value="all"
            className="text-[13px] rounded-none cursor-pointer"
          >
            All notes
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="today"
            className="text-[13px] rounded-none cursor-pointer"
          >
            Today
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TodoItem({
  todo,
  onUpdate,
  onDelete,
  showActions,
}: {
  todo: Todo;
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
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
    <div
      className={cn(
        "shrink-0 flex items-center transition-colors duration-120",
        showActions ? "gap-2.5 py-1 hover:bg-surface-2" : "gap-2 py-1",
      )}
    >
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
            "text-sm flex-1 min-w-0 leading-snug cursor-text",
            /* note: one line per task in the card preview, same as .rich-readonly */
            showActions ? "break-words" : "line-clamp-1",
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
        today={todo.today}
        onChange={(attrs) => onUpdate({ id: todo.id, ...attrs })}
        onDelete={() => onDelete(todo.id)}
        showActions={showActions}
      />
    </div>
  );
}

/* note: renders as footer-bar children, so the parent owns the flex row */
function AddTodo({
  noteId,
  lastTodoId,
  onCreate,
  showSubmit,
}: AddTarget & { showSubmit?: boolean }) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onCreate({ id: newId(), noteId, text: trimmed, lastTodoId });
      setText("");
    } else {
      setActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setText("");
      setActive(false);
    }
  };

  return (
    <>
      {active ? (
        <div className="flex flex-1 min-w-0 items-center gap-2">
          <IconPlus size={16} className="text-ink-3 flex-none" />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder="New todo..."
            className="text-sm flex-1 min-w-0 leading-snug bg-transparent outline-none placeholder:text-ink-3"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={open}
          className="flex flex-1 min-w-0 items-center gap-2 text-ink-3 hover:text-ink-2 transition-colors duration-120 cursor-pointer"
        >
          <IconPlus size={16} className="flex-none" />
          <span className="text-sm">Add todo</span>
        </button>
      )}

      {showSubmit && (
        <button
          type="button"
          /* note: keep focus on the input so its blur-commit does not race this click */
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (active ? commit() : open())}
          className={CIRCLE_BTN}
          title={active ? "Add todo" : "New todo"}
          aria-label={active ? "Add todo" : "New todo"}
        >
          {active ? <IconArrowRight size={15} /> : <IconPlus size={15} />}
        </button>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-(--ink-3)">
      <div className="text-[17px] font-semibold text-ink-2">No todos yet</div>
      <div className="text-sm max-w-75">Your todos will appear here.</div>
    </div>
  );
}
